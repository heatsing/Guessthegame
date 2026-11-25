import assert from "node:assert/strict";

import { gradeAnswer, normalizeTitle, revealTitle, withResultAccuracy } from "../lib/play/grading";
import { toPublicRound } from "../lib/play/service";
import { canAdvanceAfter } from "../lib/play/result";
import type { AnswerConfig, QuestionVersion } from "../lib/play/types";

function question(answerConfig: AnswerConfig, gameSlug = "sample-game"): QuestionVersion {
  return {
    questionId: "sample",
    gameSlug,
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
  gradeAnswer(question({ type: "title", answer: "King Kong (2005)", aliases: ["King Kong"] }, "guess-the-movie"), "King Kong (2006)", 0),
  { status: "retry", accuracy: 80, message: "Check the release year." },
);
const movie = question({ type: "title", answer: "Finding Nemo", aliases: [] }, "guess-the-movie");
for (const guess of ["Finding Nemo 2", "Finding Nemo2", "Finding Nemo-2", "Finding Nemo ２", "Finding Nemo II", "Finding Nemo Ⅱ"]) {
  const rejected = gradeAnswer(movie, guess, 0);
  assert.equal(rejected.status, "retry");
  assert.equal(rejected.status === "retry" && rejected.message, "Check the sequel number.");
}
assert.equal(gradeAnswer(movie, "Findng Nemo", 0).status, "settled");
assert.equal(withResultAccuracy(movie, {
  outcome: "correct", accuracy: 85.71, answer: "Finding Nemo", guess: "Finding Nemo 2", explanation: "", sources: [],
}).accuracy, 85.71);
const book = question({ type: "title", answer: "Treasures Book II", aliases: [] }, "guess-the-book");
assert.deepEqual(gradeAnswer(book, "Treasures Book III", 0), { status: "retry", accuracy: 80, message: "Check the volume number." });
assert.equal(gradeAnswer(book, "Tresures Book II", 0).status, "settled");
const skipped = revealTitle(book);
assert.ok(skipped.status === "settled" && skipped.result.outcome === "skipped" && canAdvanceAfter(skipped.result));
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
assert.deepEqual(gradeAnswer(size, "9.6", 0), { status: "retry", accuracy: 80, message: "Too low" });
assert.deepEqual(gradeAnswer(size, "14.4", 0), { status: "retry", accuracy: 80, message: "Too high" });
assert.deepEqual(gradeAnswer(size, "50", 0), { status: "retry", accuracy: 0, message: "Too high" });
assert.equal(gradeAnswer(size, "9.60001", 0).status, "settled");
assert.equal(gradeAnswer(size, "14.39999", 0).status, "settled");
const shelf = {
  ...question({ type: "number", target: 134, min: 129, max: 139, unit: "cm" }, "guess-the-size"),
  explanation: "The shelves are 134 cm tall. This question accepts 129–139 cm.",
};
const shelfGuess = gradeAnswer(shelf, "112", 0);
assert.ok(shelfGuess.status === "settled");
assert.equal(shelfGuess.result.accuracy, 83.58);
assert.equal(shelfGuess.result.explanation, "The shelves are 134 cm tall.");
assert.equal(gradeAnswer(shelf, "107.2", 0).status, "retry");
assert.equal(gradeAnswer(shelf, "160.8", 0).status, "retry");
const zero = question({ type: "number", target: 0, min: 0, max: 1, unit: "mm" });
const zeroGuess = gradeAnswer(zero, "0", 0);
assert.equal(zeroGuess.status === "settled" && zeroGuess.result.accuracy, 100);
assert.deepEqual(gradeAnswer(zero, "1", 0), { status: "retry", accuracy: 0, message: "Too high" });
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
const incorrect = gradeAnswer(yesNo, true, 0);
assert.ok(incorrect.status === "settled");
assert.equal(incorrect.result.outcome, "incorrect");
assert.equal(incorrect.result.accuracy, 0);
assert.equal(incorrect.result.explanation, "Private explanation");
assert.equal(canAdvanceAfter(incorrect.result), true);
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
