import type { playGames } from "./play/games";

export const gamePresentation = {
  "guess-the-movie": { image: "/home/movie.webp", caption: "Name the film from a plot clue." },
  "guess-the-book": { image: "/home/book.webp", caption: "Find the title hidden in a story." },
  "guess-the-word": { image: "/home/word.webp", caption: "Find the word that fits the definition." },
  "guess-the-plant": { image: "/home/plant.webp", caption: "Identify the plant from its features." },
  "guess-the-size": { image: "/home/size.webp", caption: "Estimate an everyday measurement." },
  "yes-or-no": { image: "/home/logic.webp", caption: "Decide what follows from the clues." },
} satisfies Record<(typeof playGames)[number]["slug"], { image: string; caption: string }>;
