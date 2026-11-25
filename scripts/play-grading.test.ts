import assert from "node:assert/strict";

import { gradeAnswer, normalizeTitle, revealTitle } from "../lib/play/grading";
import { toPublicRound } from "../lib/play/service";
import type { AnswerConfig, QuestionVersion } from "../lib/play/types";

function question(answerConfig: AnswerConfig): QuestionVersion {
  return {
    questionId: "sample",
    gameSlug: "sample-game",
    revision: 1,
    prompt: "Public clue",
    hints: ["Private hint"],
    answerConfig,
    explanation: "Private explanation",
    sources: [{ label: "Private source", url: "https://example.test/" }],
  };
}

const title = question({ type: "title", answer: "The Hobbit", aliases: [] });
const exact = gradeAnswer(title, "  THE  HOBBIT ", 0);
assert.equal(exact.status === "settled" && exact.result.outcome, "correct");
assert.equal(gradeAnswer(title, "Hobbit", 0).status, "retry");
const alias = question({ type: "title", answer: "The Hobbit", aliases: ["Hobbit"] });
const assisted = gradeAnswer(alias, "Hobbit", 1);
assert.equal(assisted.status === "settled" && assisted.result.outcome, "assisted");
assert.equal(normalizeTitle("  ‘Title’   “Version”  "), "'title' \"version\"");
assert.equal(revealTitle(title).status, "settled");

const size = question({ type: "number", target: 12, min: 10, max: 14, unit: "mm" });
for (const [guess, expected] of [["10", "within"], ["14", "within"], ["14.01", "high"], ["9.99", "low"]]) {
  const grade = gradeAnswer(size, guess, 0);
  assert.equal(grade.status === "settled" && grade.result.outcome, expected);
}
for (const guess of ["", "-0.01", "1 cm", "1e1", "NaN", Infinity, false]) {
  assert.equal(gradeAnswer(size, guess, 0).status, "invalid");
}
assert.equal(revealTitle(size).status, "invalid");

const yesNo = question({ type: "boolean", answer: false });
const no = gradeAnswer(yesNo, false, 0);
assert.equal(no.status === "settled" && no.result.outcome, "correct");
assert.equal(no.status === "settled" && no.result.answer, false);
assert.equal(gradeAnswer(yesNo, "false", 0).status, "invalid");
assert.equal(gradeAnswer(yesNo, undefined, 0).status, "invalid");

const publicRound = toPublicRound({
  id: "test",
  question: size,
  version: 0,
  hintCount: 0,
  result: null,
  sessionId: null,
  createdAt: 0,
});
assert.deepEqual(publicRound, {
  id: "test",
  questionId: "sample",
  revision: 1,
  prompt: "Public clue",
  answerType: "number",
  unit: "mm",
});
console.log("Play grading and public fields passed.");
