import { z } from "zod";

import { guessingGames } from "../guessing-games";
import { findPlayGame } from "./games";
import { normalizeTitle } from "./grading";
import type { AnswerConfig, Source } from "./types";

const columns = [
  "game_slug",
  "question_key",
  "topic_slug",
  "topic_name",
  "difficulty",
  "prompt",
  "hints",
  "answer_config",
  "explanation",
  "sources",
] as const;

const key = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const difficulty = z.enum(["easy", "medium", "hard"]);
const hintList = z.array(z.string().trim().min(1).max(500)).max(2);
const sourceList = z.array(z.object({
  label: z.string().trim().min(1).max(200),
  url: z.string().url().refine((url) => url.startsWith("https://")),
}).strict()).max(8);
const measurement = z.number().finite().nonnegative();
const title = z.string().trim().min(1).max(200);
const answerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("title"), answer: title, aliases: z.array(title).max(24) }).strict(),
  z.object({
    type: z.literal("number"),
    target: measurement,
    unit: z.string().trim().min(1).max(20),
    min: measurement,
    max: measurement,
  }).strict(),
  z.object({ type: z.literal("boolean"), answer: z.boolean() }).strict(),
]);

type QuestionInput = {
  gameSlug: string;
  questionKey: string;
  topicSlug: string | null;
  topicName: string | null;
  difficulty: z.infer<typeof difficulty>;
  prompt: string;
  hints: string[];
  answerConfig: AnswerConfig;
  explanation: string;
  sources: Source[];
};

type CsvRow = { line: number; values: string[] };

function readCsv(raw: string): CsvRow[] {
  if (raw.includes("\0")) throw new Error("CSV contains a null character.");

  const input = raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rows: CsvRow[] = [];
  let values: string[] = [];
  let value = "";
  let mode: "start" | "plain" | "quoted" | "closed" = "start";
  let line = 1;
  let rowLine = 1;

  function finishValue() {
    values.push(value.trim());
    value = "";
    mode = "start";
  }

  function finishRow() {
    finishValue();
    if (values.length > 1 || values[0]) rows.push({ line: rowLine, values });
    values = [];
    rowLine = line + 1;
  }

  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (mode === "quoted") {
      if (char === '"' && input[index + 1] === '"') {
        value += '"';
        index++;
      } else if (char === '"') {
        mode = "closed";
      } else {
        value += char;
      }
    } else if (char === ",") {
      finishValue();
    } else if (char === "\n") {
      finishRow();
    } else if (char === '"' && mode === "start") {
      mode = "quoted";
    } else if (mode === "closed" && /^[ \t]$/.test(char)) {
      continue;
    } else if (mode === "closed" || char === '"') {
      throw new Error(`Line ${line}: unexpected character near a CSV quote.`);
    } else {
      value += char;
      mode = "plain";
    }
    if (char === "\n") line++;
  }

  if (mode === "quoted") throw new Error(`Line ${rowLine}: unclosed CSV quote.`);
  finishRow();
  return rows;
}

function fromJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}

function gameAnswerType(slug: string) {
  return findPlayGame(slug)?.answerType ??
    (guessingGames.some((game) => game.path === `/${slug}/`) ? "title" : null);
}

export function preflightQuestions(raw: string) {
  const [header, ...rows] = readCsv(raw);
  if (!header || header.values.length !== columns.length ||
    !columns.every((column) => header.values.includes(column))) {
    throw new Error(`Expected CSV columns ${columns.join(", ")}.`);
  }

  const questions: QuestionInput[] = [];
  const errors: string[] = [];
  const duplicates: string[] = [];
  const found = new Set<string>();
  const acceptedTitles = new Map<string, { answer: string; line: number }>();
  const topicNames = new Map<string, string>();

  for (const { line, values } of rows) {
    const issue = (message: string) => errors.push(`Line ${line}: ${message}`);
    if (values.length !== columns.length) {
      issue(`expected ${columns.length} fields, got ${values.length}.`);
      continue;
    }

    const get = (column: (typeof columns)[number]) => values[header.values.indexOf(column)];
    const gameSlug = get("game_slug");
    const questionKey = get("question_key");
    const rowKey = `${gameSlug}/${questionKey}`;
    if (found.has(rowKey)) {
      duplicates.push(`Line ${line}: repeated ${rowKey} skipped.`);
      continue;
    }

    const before = errors.length;
    const answerType = gameAnswerType(gameSlug);
    const topicSlug = get("topic_slug");
    const topicName = get("topic_name");
    const level = difficulty.safeParse(get("difficulty"));
    const prompt = get("prompt");
    const explanation = get("explanation");
    const hints = hintList.safeParse(fromJson(get("hints") || "[]"));
    const sources = sourceList.safeParse(fromJson(get("sources") || "[]"));
    const answer = answerSchema.safeParse(fromJson(get("answer_config")));

    if (!answerType) issue("unknown game_slug.");
    if (!key.safeParse(questionKey).success) issue("question_key must be a lower-case slug.");
    if (topicSlug || topicName) {
      if (!key.safeParse(topicSlug).success || !topicName || topicName.length > 100) {
        issue("topic_slug and topic_name must both be valid when supplied.");
      }
      const knownName = topicNames.get(`${gameSlug}/${topicSlug}`);
      if (knownName && knownName !== topicName) issue("conflicting names for the same topic_slug.");
    }
    if (!level.success) issue("difficulty must be easy, medium or hard.");
    if (!prompt || prompt.length > 1500) issue("prompt must contain 1–1500 characters.");
    if (!explanation || explanation.length > 4000) issue("explanation must contain 1–4000 characters.");
    if (!hints.success) issue("hints must be a JSON array of up to two non-empty strings.");
    if (!sources.success) issue("sources must be a JSON array of label and HTTPS URL pairs.");
    if (!answer.success) {
      issue("answer_config must contain a valid answer and the fields required by its type.");
    } else {
      const config = answer.data;
      if (answerType && config.type !== answerType) issue(`answer type must be ${answerType}.`);
      if (config.type === "number") {
        if (config.min > config.max) issue("numeric range is reversed.");
        if (config.target < config.min || config.target > config.max) {
          issue("numeric reference value is outside the accepted range.");
        }
      }
      if (config.type === "title") {
        const canonical = normalizeTitle(config.answer);
        const names = [config.answer, ...config.aliases].map(normalizeTitle);
        if (new Set(names).size !== names.length) issue("aliases repeat a normalized title.");
        for (const name of new Set(names)) {
          const earlier = acceptedTitles.get(`${gameSlug}/${name}`);
          if (earlier && earlier.answer !== canonical) {
            issue(`title or alias "${name}" conflicts with the answer on line ${earlier.line}.`);
          }
        }
        if (errors.length === before) {
          for (const name of names) acceptedTitles.set(`${gameSlug}/${name}`, { answer: canonical, line });
        }
      }
    }

    if (errors.length !== before || !level.success || !hints.success || !sources.success || !answer.success) {
      continue;
    }
    if (topicSlug) topicNames.set(`${gameSlug}/${topicSlug}`, topicName);
    found.add(rowKey);
    questions.push({
      gameSlug,
      questionKey,
      topicSlug: topicSlug || null,
      topicName: topicName || null,
      difficulty: level.data,
      prompt,
      hints: hints.data,
      answerConfig: answer.data,
      explanation,
      sources: sources.data,
    });
  }

  if (!rows.length) errors.push("The CSV contains no questions.");
  return { questions, errors, duplicates };
}

export type { QuestionInput };
