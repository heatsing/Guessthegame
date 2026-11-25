import type { PlayGame } from "./types";

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
    rule: "Look for the characters' choices and the details that set their story apart. Enter the book title and score more than 80% to unlock the next clue. You can try again or request an available hint.",
  },
  {
    slug: "guess-the-size",
    name: "Guess the Size",
    answerType: "number",
    title: "Guess the Size From Clues",
    description: "Estimate a measurement from written clues, check your accuracy and unlock the reference value and calculation.",
    rule: "Read the assumptions and enter a number in the unit shown. You can adjust your estimate and try again. A score above 80% reveals the reference measurement and unlocks the next question.",
  },
  {
    slug: "yes-or-no",
    name: "Yes or No?",
    answerType: "boolean",
    title: "Yes or No? Logic Puzzles",
    description: "Read the whole setup and decide whether the conclusion must follow. Solve the puzzle to see the reasoning and unlock the next one.",
    rule: "Choose Yes when the conclusion must be true under the stated conditions. Choose No if you can make a valid example where it fails. A correct choice scores 100% and unlocks the explanation.",
  },
] as const satisfies readonly PlayGame[];

export function findPlayGame(slug: string) {
  return playGames.find((game) => game.slug === slug);
}

export function isPlayablePath(path: string) {
  return playGames.some(({ slug }) => path === `/${slug}/`);
}
