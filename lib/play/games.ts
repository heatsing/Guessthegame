import type { PlayGame } from "./types";
import { sizeRule } from "./result";

export const playGames = [
  {
    slug: "guess-the-movie",
    name: "Guess the Movie",
    answerType: "title",
    title: "Guess the Movie From Clues",
    description: "Use a scene, event or character goal to guess the film. Try again, request a hint or reveal the answer.",
    rule: "Read the clue and enter a film title. Score more than 80% to advance, or try another title and use available hints. If the clue asks for a particular release, follow its year format.",
  },
  {
    slug: "guess-the-book",
    name: "Guess the Book",
    answerType: "title",
    title: "Guess the Book From Clues",
    description: "Identify a book from a written story clue. Make another guess, ask for a hint, or read the answer and explanation.",
    rule: "Look for the characters' choices and details that set their story apart. Guess the title or select Reveal answer to skip the question and continue to the next book.",
  },
  {
    slug: "guess-the-word",
    name: "Guess the Word",
    answerType: "title",
    title: "Guess the Word From Its Definition",
    description: "Play an English vocabulary game. Guess the word from a written definition, its part of speech, and a sentence clue.",
    rule: "Read the definition and part of speech. Enter a single English word that fits the sentence and score more than 80% to unlock the next clue. You can try again or ask for a hint.",
  },
  {
    slug: "guess-the-size",
    name: "Guess the Size",
    answerType: "number",
    title: "Guess the Size From Clues",
    description: "Estimate a measurement from written clues, check your accuracy and unlock the reference value and calculation.",
    rule: `Read the assumptions and enter a number in the unit shown. ${sizeRule} Adjust your estimate after seeing Too low or Too high.`,
  },
  {
    slug: "yes-or-no",
    name: "Yes or No?",
    answerType: "boolean",
    title: "Yes or No? Logic Puzzles",
    description: "Read the setup and decide whether the conclusion must follow. See the reasoning after your first choice, then try another puzzle.",
    rule: "Choose Yes when the conclusion must follow. Choose No when a counterexample fits all the conditions. Your first choice shows the explanation and opens the next puzzle.",
  },
] as const satisfies readonly PlayGame[];

export function findPlayGame(slug: string) {
  return playGames.find((game) => game.slug === slug);
}

export function isPlayablePath(path: string) {
  return playGames.some(({ slug }) => path === `/${slug}/`);
}
