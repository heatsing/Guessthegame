type GuessingGame = {
  name: string;
  description: string;
  path: `/${string}/`;
  order: number;
};

export const guessingGames: readonly GuessingGame[] = [
  {
    name: "Guess the Movie",
    description: "Read a short plot clue and type the movie title.",
    path: "/guess-the-movie/",
    order: 1,
  },
  {
    name: "Guess the Book",
    description: "Read the clues and type the book title.",
    path: "/guess-the-book/",
    order: 2,
  },
  {
    name: "Guess the Size",
    description: "Use the clues to estimate a real-world measurement.",
    path: "/guess-the-size/",
    order: 3,
  },
  {
    name: "Yes or No?",
    description: "Read a short setup and decide whether the conclusion follows.",
    path: "/yes-or-no/",
    order: 4,
  },
];
