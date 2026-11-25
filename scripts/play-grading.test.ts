import assert from "node:assert/strict";

import { gradeAnswer, normalizeTitle, revealTitle, withResultAccuracy } from "../lib/play/grading";
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
assert.equal(exact.status === "settled" && exact.result.accuracy, 100);
assert.equal(gradeAnswer(title, "Hobbit", 0).status, "retry");
const typo = gradeAnswer(title, "The Hobbitt", 0);
assert.equal(typo.status === "settled" && typo.result.accuracy, 90.91);
assert.deepEqual(
  gradeAnswer(question({ type: "title", answer: "Alien", aliases: [] }), "Aliex", 0),
  { status: "retry", accuracy: 80 },
);
assert.deepEqual(
  gradeAnswer(question({ type: "title", answer: "King Kong (2005)", aliases: [] }), "King Kong (2006)", 0),
  { status: "retry", accuracy: 80 },
);
const alias = question({ type: "title", answer: "The Hobbit", aliases: ["Hobbit"] });
const assisted = gradeAnswer(alias, "Hobbit", 1);
assert.equal(assisted.status === "settled" && assisted.result.outcome, "assisted");
assert.equal(normalizeTitle("  ‘Title’   “Version”  "), "'title' \"version\"");
assert.equal(revealTitle(title).status, "settled");

const size = question({ type: "number", target: 12, min: 10, max: 14, unit: "mm" });
for (const [guess, expected] of [["10", 83.33], ["14", 83.33], ["14.01", 83.25], ["9.99", 83.25]] as const) {
  const grade = gradeAnswer(size, guess, 0);
  assert.equal(grade.status === "settled" && grade.result.accuracy, expected);
}
assert.deepEqual(gradeAnswer(size, "9.6", 0), { status: "retry", accuracy: 80 });
assert.deepEqual(gradeAnswer(size, "14.4", 0), { status: "retry", accuracy: 80 });
assert.deepEqual(gradeAnswer(size, "50", 0), { status: "retry", accuracy: 0 });
const zero = question({ type: "number", target: 0, min: 0, max: 1, unit: "mm" });
const zeroGuess = gradeAnswer(zero, "0", 0);
assert.equal(zeroGuess.status === "settled" && zeroGuess.result.accuracy, 100);
assert.deepEqual(gradeAnswer(zero, "1", 0), { status: "retry", accuracy: 0 });
assert.equal(withResultAccuracy(size, { outcome: "high", answer: 12, guess: 15, explanation: "", sources: [] }).accuracy, 75);
for (const guess of ["", "-0.01", "1 cm", "1e1", "NaN", Infinity, false]) {
  assert.equal(gradeAnswer(size, guess, 0).status, "invalid");
}
assert.equal(revealTitle(size).status, "invalid");

const yesNo = question({ type: "boolean", answer: false });
const no = gradeAnswer(yesNo, false, 0);
assert.equal(no.status === "settled" && no.result.outcome, "correct");
assert.equal(no.status === "settled" && no.result.answer, false);
assert.equal(no.status === "settled" && no.result.accuracy, 100);
assert.deepEqual(gradeAnswer(yesNo, true, 0), { status: "retry", accuracy: 0 });
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
