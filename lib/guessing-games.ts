type GuessingGame = {
  name: string;
  description: string;
  path: `/${string}/`;
  order: number;
};

export const guessingGames = [
  {
    name: "Guess the Movie",
    description: "Name the film from a clue.",
    path: "/guess-the-movie/",
    order: 1,
  },
  {
    name: "Guess the Book",
    description: "Name the book from its story.",
    path: "/guess-the-book/",
    order: 2,
  },
  {
    name: "Guess the Word",
    description: "Find the word that fits.",
    path: "/guess-the-word/",
    order: 3,
  },
  {
    name: "Guess the Plant",
    description: "Identify it from written clues.",
    path: "/guess-the-plant/",
    order: 4,
  },
  {
    name: "Guess the Size",
    description: "Estimate the measurement.",
    path: "/guess-the-size/",
    order: 5,
  },
  {
    name: "Yes or No?",
    description: "Decide what follows.",
    path: "/yes-or-no/",
    order: 6,
  },
] as const satisfies readonly GuessingGame[];
