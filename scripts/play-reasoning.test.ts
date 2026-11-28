import assert from "node:assert/strict";
import { answerReasoning } from "../lib/play/reasoning";

const prompt = "The sign reads “open”. A cat's bell rings. Its owner’s hand is empty.";
const body = "The sound comes from the bell, which is attached to the cat.";

assert.deepEqual(
  answerReasoning(prompt, `Key clue — “A cat's bell rings”. ${body}`),
  { clues: ["A cat's bell rings"], explanation: body },
);
assert.deepEqual(
  answerReasoning(prompt, `Key clues — "A cat's bell rings." and “Its owner’s hand is empty.”.\n${body}`),
  { clues: ["A cat's bell rings.", "Its owner’s hand is empty."], explanation: body },
);
assert.deepEqual(
  answerReasoning(prompt, `Key clue — "The sign reads “open”". ${body}`),
  { clues: ["The sign reads “open”"], explanation: body },
);

for (const explanation of [
  body,
  `${body} Key clue — “A cat's bell rings”. An added note.`,
  `Key clue — “A cat's bell rings”.    `,
  `Key clue — “A cat’s bell rings”. ${body}`,
  `Key clues — “A cat's bell rings” and “Its owner's hand is empty”. ${body}`,
  `Key clues — “A cat's bell rings”. ${body}`,
  `Key clue — “A cat's bell rings” and “Its owner’s hand is empty”. ${body}`,
  `Key clue — “A cat's bell rings". ${body}`,
  `Key clue — “Its owner's hand is empty”. ${body}`,
  `Key clue — “ ”. ${body}`,
  `Key clue — “A cat's bell rings” ${body}`,
]) {
  assert.deepEqual(answerReasoning(prompt, explanation), { clues: [], explanation });
}

console.log("answer reasoning tests passed");
