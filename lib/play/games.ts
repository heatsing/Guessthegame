import type { PlayGame } from "./types";

export const playGames = [
  {
    slug: "guess-the-movie",
    name: "Guess the Movie",
    answerType: "title",
    title: "Guess the Movie From Clues",
    description: "Use a scene, event or character goal to guess the film. Try again, request a hint or reveal the answer.",
    rule: "Read the clue and enter a film title. You can try again, use up to two hints, or choose Show Answer. If a question asks for a remake or a particular release, use the year format shown in the clue.",
  },
  {
    slug: "guess-the-book",
    name: "Guess the Book",
    answerType: "title",
    title: "Guess the Book From Clues",
    description: "Identify a book from a written story clue. Make another guess, ask for a hint, or read the answer and explanation.",
    rule: "Look for the characters' choices and the details that set their story apart. Enter the book title. You can keep guessing, request up to two hints, or choose Show Answer.",
  },
  {
    slug: "guess-the-size",
    name: "Guess the Size",
    answerType: "number",
    title: "Guess the Size From Clues",
    description: "Estimate a measurement from written facts, then see the reference value, accepted range and how to work it out.",
    rule: "Read the assumptions and enter a number in the unit shown. Each question has its own acceptable range, including both endpoints. One valid estimate reveals the reference measurement and the calculation.",
  },
  {
    slug: "yes-or-no",
    name: "Yes or No?",
    answerType: "boolean",
    title: "Yes or No? Logic Puzzles",
    description: "Read the whole setup and decide whether the conclusion must follow. Check the reasoning after your first choice.",
    rule: "Choose Yes when the conclusion must be true under the stated conditions. Choose No if you can make a valid example where it fails. Your first choice reveals the explanation.",
  },
] as const satisfies readonly PlayGame[];

export function findPlayGame(slug: string) {
  return playGames.find((game) => game.slug === slug);
}

export function isPlayablePath(path: string) {
  return playGames.some(({ slug }) => path === `/${slug}/`);
}
