import assert from "node:assert/strict";

import { preflightQuestions } from "../lib/play/editorial-import";

const header = "game_slug,question_key,topic_slug,topic_name,difficulty,prompt,hints,answer_config,explanation,sources";
const quoted = (value: unknown) => `"${String(value).replaceAll('"', '""')}"`;
const row = (
  game: string,
  key: string,
  answer: unknown,
  explanation = "An explanation.",
  clue = 'A "quoted", two-line clue.\nWhat is the answer?',
) => [game, key, "sample-topic", "Sample Topic", "easy", clue, '["A clue."]', JSON.stringify(answer), explanation, "[]"]
  .map(quoted)
  .join(",");
const csv = (...rows: string[]) => `\uFEFF${[header, ...rows].join("\r\n")}\r\n`;

const bookAnswer = { type: "title", answer: "The Hobbit", aliases: [] };
const initial = row("guess-the-book", "homebody-quest", bookAnswer);
const duplicate = preflightQuestions(csv(initial, initial));
assert.equal(duplicate.questions.length, 1);
assert.equal(duplicate.duplicates.length, 1);
assert.deepEqual(duplicate.errors, []);
assert.equal(duplicate.questions[0].prompt, 'A "quoted", two-line clue.\nWhat is the answer?');

const errors = preflightQuestions(csv(
  row("guess-the-size", "reversed", { type: "number", target: 15, min: 14, max: 10, unit: "mm" }, ""),
  row("guess-the-book", "normalized-title", { type: "title", answer: "The Hobbit", aliases: ["THE  HOBBIT"] }),
  row("guess-the-book", "no-answer", { type: "title", aliases: [] }),
)).errors.join("\n");
assert.match(errors, /numeric range is reversed/);
assert.match(errors, /numeric reference value is outside the accepted range/);
assert.match(errors, /explanation must contain/);
assert.match(errors, /aliases repeat a normalized title/);
assert.match(errors, /must contain a valid answer/);

const conflicts = preflightQuestions(csv(
  initial,
  row("guess-the-book", "same-alias", { type: "title", answer: "Another Book", aliases: ["the hobbit"] }),
));
assert.match(conflicts.errors.join("\n"), /conflicts with the answer on line 2/);

const falseAnswer = preflightQuestions(csv(row("yes-or-no", "no-is-valid", { type: "boolean", answer: false })));
assert.deepEqual(falseAnswer.errors, []);
assert.deepEqual(falseAnswer.questions[0].answerConfig, { type: "boolean", answer: false });

console.log("question CSV preflight tests passed");
