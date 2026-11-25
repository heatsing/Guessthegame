import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { preflightQuestions, type QuestionInput } from "../lib/play/editorial-import";
import { gradeAnswer } from "../lib/play/grading";
import { STATISTICS_SQL } from "../lib/play/statistics";
import type { QuestionVersion } from "../lib/play/types";

const usage = [
  "tsx scripts/play-questions.ts preflight <csv>",
  "tsx scripts/play-questions.ts import|revise <csv> [--remote]",
  "tsx scripts/play-questions.ts publish-file <csv> [--available-at TIMESTAMP] [--remote]",
  "tsx scripts/play-questions.ts preview <game-slug> <question-key> [--revision N] [--guess VALUE] [--hints N] [--remote]",
  "tsx scripts/play-questions.ts publish <game-slug> <question-key> [--available-at TIMESTAMP] [--remote]",
  "tsx scripts/play-questions.ts archive <game-slug> <question-key> [--remote]",
  "tsx scripts/play-questions.ts invalidate <game-slug> <question-key> <revision> [--remote]",
  "tsx scripts/play-questions.ts stats [game-slug] [--remote]",
].join("\n");

type SqlRow = Record<string, unknown>;
type SqlResult = { results: SqlRow[]; success: boolean };
const remoteCommandLimit = 16_000;

function sql(value: string | number | null) {
  if (value === null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

function questionWhere(gameSlug: string, questionKey: string) {
  return `game_slug = ${sql(gameSlug)} AND question_key = ${sql(questionKey)}`;
}

function queryDatabase(statements: string[], remote: boolean): SqlResult[] {
  if (statements.length === 0) return [];
  const command = statements.join(";\n") + ";\n";
  if (remote && command.length > remoteCommandLimit) throw new Error("A question exceeds the remote SQL command size limit.");
  const directory = remote ? null : mkdtempSync(join(tmpdir(), "guessthegame-editor-"));
  const file = directory ? join(directory, "editor.sql") : null;
  try {
    if (file) writeFileSync(file, command, "utf8");
    const wrangler = resolve("node_modules", "wrangler", "bin", "wrangler.js");
    const { stdout, stderr, status, error } = spawnSync(process.execPath, [
      wrangler, "d1", "execute", "PLAY_DB",
      ...(file ? ["--file", file] : ["--command", command]),
      remote ? "--remote" : "--local", "--json", "--yes",
    ], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
    if (error) throw error;
    if (status !== 0) throw new Error(stderr.trim() || stdout.trim() || "Wrangler D1 execution failed.");
    const firstLine = stdout.search(/^\s*\[\s*$/m);
    const lastLine = stdout.lastIndexOf("\n]");
    const payload = firstLine >= 0 && lastLine >= firstLine ? stdout.slice(firstLine, lastLine + 2) : stdout;
    let results: SqlResult[];
    try {
      results = JSON.parse(payload);
    } catch {
      throw new Error("Wrangler did not return valid D1 JSON results.");
    }
    if (!Array.isArray(results) || results.length !== statements.length ||
      results.some((result) => result?.success !== true || !Array.isArray(result.results))) {
      throw new Error("Wrangler did not return one successful result per D1 statement.");
    }
    return results;
  } finally {
    if (file && directory) {
      rmSync(file, { force: true });
      rmdirSync(directory);
    }
  }
}

function queryBatches(groups: string[][], remote: boolean) {
  const results: SqlResult[] = [];
  let batch: string[] = [];
  let length = 0;

  for (const group of groups) {
    const groupLength = group.reduce((total, statement) => total + statement.length + 2, 0);
    if (batch.length && (batch.length + group.length > 120 ||
      (remote && length + groupLength > remoteCommandLimit))) {
      results.push(...queryDatabase(batch, remote));
      batch = [];
      length = 0;
    }
    batch.push(...group);
    length += groupLength;
  }
  return [...results, ...queryDatabase(batch, remote)];
}

function readQuestions(file: string) {
  const { questions, errors, duplicates } = preflightQuestions(readFileSync(file, "utf8"));
  for (const duplicate of duplicates) console.log(duplicate);
  if (errors.length) throw new Error(errors.join("\n"));
  return questions;
}

function topicStatement(question: QuestionInput, onlyNew = false) {
  if (!question.topicSlug || !question.topicName) return [];
  const missingKey = onlyNew
    ? `NOT EXISTS (SELECT 1 FROM questions WHERE ${questionWhere(question.gameSlug, question.questionKey)})`
    : "1";
  return [`INSERT INTO topics (game_slug, slug, name)
    SELECT ${sql(question.gameSlug)}, ${sql(question.topicSlug)}, ${sql(question.topicName)}
    WHERE ${missingKey}
    ON CONFLICT (game_slug, slug) DO NOTHING`];
}

function revisionValues(question: QuestionInput, now: number) {
  return [
    question.prompt,
    JSON.stringify(question.hints),
    JSON.stringify(question.answerConfig),
    question.explanation,
    JSON.stringify(question.sources),
    now,
  ].map(sql).join(", ");
}

const revisionColumns =
  "question_id, revision, prompt, hints_json, answer_config_json, explanation, sources_json, created_at";

function importQuestions(questions: QuestionInput[], remote: boolean) {
  const now = Date.now();
  const indexes: number[] = [];
  let statementCount = 0;
  const groups = questions.map((question) => {
    const id = randomUUID();
    const topic = topicStatement(question, true);
    indexes.push(statementCount + topic.length);
    const group = [
      ...topic,
      `INSERT INTO questions (id, game_slug, question_key, topic_slug, difficulty, updated_at)
        VALUES (${sql(id)}, ${sql(question.gameSlug)}, ${sql(question.questionKey)}, ${sql(question.topicSlug)}, ${sql(question.difficulty)}, ${now})
        ON CONFLICT (game_slug, question_key) DO NOTHING RETURNING id`,
      `INSERT INTO question_revisions (${revisionColumns})
        SELECT ${sql(id)}, 1, ${revisionValues(question, now)}
        WHERE EXISTS (SELECT 1 FROM questions WHERE id = ${sql(id)})`,
    ];
    statementCount += group.length;
    return group;
  });

  const results = queryBatches(groups, remote);
  const imported = indexes.filter((index) => results[index]?.results.length).length;
  console.log(`Imported ${imported} draft question(s). Skipped ${questions.length - imported} existing key(s).`);
}

function reviseQuestion(question: QuestionInput, remote: boolean) {
  const key = questionWhere(question.gameSlug, question.questionKey);
  const now = Date.now();
  const statements = [
    ...topicStatement(question),
    `INSERT INTO question_revisions (${revisionColumns})
      SELECT id, revision + 1, ${revisionValues(question, now)} FROM questions WHERE ${key}`,
    `UPDATE questions SET revision = revision + 1, topic_slug = ${sql(question.topicSlug)},
      difficulty = ${sql(question.difficulty)}, updated_at = ${now} WHERE ${key} RETURNING revision`,
  ];
  const result = queryDatabase(statements, remote).at(-1);
  if (!result?.results.length) throw new Error("Question key was not found. Import it as a draft first.");
  console.log("Saved a new revision for review.");
}

type PublicationKey = { gameSlug: string; questionKey: string; expected?: QuestionInput };

function publicationSql({ gameSlug, questionKey, expected }: PublicationKey, availableAt: number | null) {
  const match = expected
    ? `AND qr.prompt = ${sql(expected.prompt)}
       AND qr.hints_json = ${sql(JSON.stringify(expected.hints))}
       AND qr.answer_config_json = ${sql(JSON.stringify(expected.answerConfig))}
       AND qr.explanation = ${sql(expected.explanation)}
       AND qr.sources_json = ${sql(JSON.stringify(expected.sources))}
       AND questions.difficulty = ${sql(expected.difficulty)}
       AND questions.topic_slug IS ${sql(expected.topicSlug)}`
    : "";
  return `UPDATE questions SET status = 'published', published_revision = revision,
    available_at = ${sql(availableAt)}, updated_at = ${Date.now()}
    WHERE ${questionWhere(gameSlug, questionKey)}
    AND EXISTS (
      SELECT 1 FROM question_revisions AS qr
      WHERE qr.question_id = questions.id AND qr.revision = questions.revision AND qr.invalidated_at IS NULL
      ${match}
    ) RETURNING id`;
}

function publishQuestions(keys: PublicationKey[], remote: boolean, availableAt: number | null) {
  const results = queryBatches(keys.map((key) => [publicationSql(key, availableAt)]), remote);
  const count = results.filter((result) => result.results.length).length;
  keys.forEach(({ gameSlug, questionKey }, index) => {
    if (!results[index]?.results.length) {
      console.warn(`Skipped ${gameSlug}/${questionKey} because its latest revision is missing, invalidated or differs from the CSV.`);
    }
  });
  console.log(`Published ${count} of ${keys.length} requested question(s).`);
  if (count && availableAt !== null) {
    console.log(`Available from ${new Date(availableAt).toISOString()}.`);
  }
  if (count !== keys.length) process.exitCode = 1;
}

function previewQuestion(
  gameSlug: string,
  questionKey: string,
  remote: boolean,
  revision: number | null,
  guess: string | undefined,
  hintCount: number,
) {
  const [result] = queryDatabase([`SELECT q.id, q.status, q.difficulty, q.topic_slug, q.published_revision, q.available_at,
    qr.revision, qr.prompt, qr.hints_json, qr.answer_config_json, qr.explanation, qr.sources_json, qr.invalidated_at
    FROM questions AS q JOIN question_revisions AS qr ON qr.question_id = q.id
    WHERE ${questionWhere(gameSlug, questionKey)} AND qr.revision = ${revision ?? "q.revision"}`], remote);
  const row = result?.results[0];
  if (!row) throw new Error("The question or revision was not found.");

  const question: QuestionVersion = {
    questionId: String(row.id),
    gameSlug,
    revision: Number(row.revision),
    prompt: String(row.prompt),
    hints: JSON.parse(String(row.hints_json)),
    answerConfig: JSON.parse(String(row.answer_config_json)),
    explanation: String(row.explanation),
    sources: JSON.parse(String(row.sources_json)),
  };
  const previewGuess = question.answerConfig.type === "boolean"
    ? guess === "true" ? true : guess === "false" ? false : guess
    : guess;

  console.log(JSON.stringify({
    status: row.status,
    currentPublication: row.published_revision,
    availableAt: typeof row.available_at === "number" ? new Date(row.available_at).toISOString() : null,
    invalidatedAt: row.invalidated_at,
    question,
    simulation: guess === undefined ? undefined :
      gradeAnswer(question, previewGuess, Math.min(hintCount, question.hints.length)),
  }, null, 2));
}

function integer(argument: string, min: number) {
  const value = Number(argument);
  if (!/^\d+$/.test(argument) || !Number.isSafeInteger(value) || value < min) {
    throw new Error(`Expected an integer of at least ${min}.`);
  }
  return value;
}

function availabilityTimestamp(value: string) {
  const format = /^(\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)$/;
  const date = format.exec(value)?.[1];
  const instant = Date.parse(value);
  if (!date || !Number.isFinite(instant) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error("--available-at requires a valid ISO 8601 date and time with an explicit timezone, such as 2027-01-01T09:00:00+08:00.");
  }
  return instant;
}

function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      remote: { type: "boolean", default: false },
      "available-at": { type: "string" },
      guess: { type: "string" },
      revision: { type: "string" },
      hints: { type: "string", default: "0" },
      help: { type: "boolean" },
    },
  });
  const [command, first, second, third] = positionals;
  const remote = values.remote ?? false;
  if (values.help) {
    console.log(usage);
    return;
  }

  const timestamp = values["available-at"];
  if (timestamp !== undefined && command !== "publish" && command !== "publish-file") {
    throw new Error("--available-at is only supported by publish and publish-file.");
  }
  const availableAt = timestamp === undefined ? null : availabilityTimestamp(timestamp);

  if (command === "stats" && positionals.length <= 2) {
    const [result] = queryDatabase([STATISTICS_SQL], remote);
    const rows = result?.results ?? [];
    console.log(JSON.stringify(first ? rows.filter((row) => row.gameSlug === first) : rows, null, 2));
    return;
  }

  if (positionals.length === 2 && ["preflight", "import", "revise", "publish-file"].includes(command)) {
    const questions = readQuestions(first);
    if (command === "preflight") console.log(`Validated ${questions.length} question(s).`);
    if (command === "import") importQuestions(questions, remote);
    if (command === "publish-file") publishQuestions(
      questions.map((question) => ({
        gameSlug: question.gameSlug,
        questionKey: question.questionKey,
        expected: question,
      })),
      remote,
      availableAt,
    );
    if (command === "revise") {
      if (questions.length !== 1) throw new Error("Revise expects a CSV with exactly one question.");
      reviseQuestion(questions[0], remote);
    }
    return;
  }

  if (positionals.length === 3 && ["preview", "publish", "archive"].includes(command)) {
    if (command === "preview") {
      const revision = values.revision ? integer(values.revision, 1) : null;
      previewQuestion(first, second, remote, revision, values.guess, integer(values.hints ?? "0", 0));
    }
    if (command === "publish") publishQuestions([{ gameSlug: first, questionKey: second }], remote, availableAt);
    if (command === "archive") {
      const [result] = queryDatabase([`UPDATE questions SET status = 'archived', updated_at = ${Date.now()}
        WHERE ${questionWhere(first, second)} RETURNING id`], remote);
      if (!result?.results.length) throw new Error("Question key was not found.");
      console.log(`Archived ${first}/${second}.`);
    }
    return;
  }

  if (command === "invalidate" && positionals.length === 4) {
    const revision = integer(third, 1);
    const [result] = queryDatabase([`UPDATE question_revisions SET invalidated_at = ${Date.now()}
      WHERE revision = ${revision} AND invalidated_at IS NULL
      AND question_id = (SELECT id FROM questions WHERE ${questionWhere(first, second)}) RETURNING question_id`], remote);
    if (!result?.results.length) throw new Error("Revision was not found or already invalidated.");
    console.log(`Invalidated ${first}/${second} revision ${revision}.`);
    return;
  }

  throw new Error(usage);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
