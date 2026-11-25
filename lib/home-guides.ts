import type { guessingGames } from "./guessing-games";

export type HomeGuide = {
  id: string;
  title: string;
  description: string;
  readTime: number;
  paragraphs: readonly string[];
};

type BrowseTopic = {
  name: string;
  description: string;
  path: (typeof guessingGames)[number]["path"];
};

export const featuredChallenge: HomeGuide = {
  id: "movie-night",
  title: "Movie Night",
  description: "A clue-based movie guessing challenge.",
  readTime: 5,
  paragraphs: [
    "Try this clue. After a storm carries her far from home, a girl follows a yellow road and meets a scarecrow who joins her journey. Can you name the film?",
    "The film is The Wizard of Oz. A storm alone could fit many stories. The yellow road and the scarecrow make this combination easy to recognize.",
    "For your own round, pick a film everyone might know. Start with a broad clue about the main character, then offer a distinctive place or object as the second clue.",
  ],
};

export const topicPicks: readonly HomeGuide[] = [
  {
    id: "greenhouse-clues",
    title: "Greenhouse Clues",
    description: "Plants, settings and more.",
    readTime: 3,
    paragraphs: [
      "Start a plant guess with details you could spot in the greenhouse. Note the shape of the leaves, the way the stems grow, and whether flowers or fruit appear in clusters.",
      "Small yellow flowers and round fruit that ripens from green to red suggest a tomato plant. The growing location gives you a starting point and the physical details help narrow the answer.",
    ],
  },
  {
    id: "everyday-measurements",
    title: "Everyday Measurements",
    description: "Real-world sizes in context.",
    readTime: 4,
    paragraphs: [
      "Look for a familiar object that takes up about as much space as the thing you are estimating. Notice whether the clue asks for height, width, or depth so your comparison runs in the correct direction.",
      "A sheet of printer paper is about 30 centimeters long. If a desktop looks about four sheets wide, estimate its width at 120 centimeters. Write down the comparison so you can adjust it if a later clue changes your estimate.",
    ],
  },
];

export const browseTopics: readonly BrowseTopic[] = [
  {
    name: "Animated Movies",
    description: "Guess films from short clues.",
    path: "/guess-the-movie/",
  },
  {
    name: "Mystery Books",
    description: "Identify books from key details.",
    path: "/guess-the-book/",
  },
  {
    name: "Word Meanings",
    description: "Find a word from its definition.",
    path: "/guess-the-word/",
  },
  {
    name: "Garden Plants",
    description: "Recognize plants from clues.",
    path: "/guess-the-plant/",
  },
  {
    name: "Everyday Sizes",
    description: "Estimate common measurements.",
    path: "/guess-the-size/",
  },
  {
    name: "Order & Position",
    description: "Solve order, left/right and rank clues.",
    path: "/yes-or-no/",
  },
];

export const guessingGuides: readonly HomeGuide[] = [
  {
    id: "estimate-size",
    title: "How to Estimate Size from a Familiar Object",
    description: "Use everyday objects as a reference to make good size guesses.",
    readTime: 6,
    paragraphs: [
      "Choose a reference object whose size you already know. Estimate how many copies would fit across the object in the clue, then multiply by the reference size.",
      "A tennis ball is roughly 7 centimeters across. If you can picture four balls in a row across a small shelf, you have an estimate of 28 centimeters. If the clue leaves room for three to five balls, consider a range of 21 to 35 centimeters.",
    ],
  },
  {
    id: "read-plot-clue",
    title: "How to Read a Plot Clue",
    description: "Turn a few details into a strong guess.",
    readTime: 4,
    paragraphs: [
      "Pick out the main character, setting, and event that sets the story in motion. Look for one detail that would be hard to mistake, such as a town with an unusual name or an object everyone in the story is trying to find.",
      "When you have a possible title, match it against the whole clue. Ask which detail would rule your guess out. The answer should account for the character and setting as well as the most memorable event.",
    ],
  },
  {
    id: "word-definition",
    title: "Finding a Word from Its Definition",
    description: "Practical steps to go from a meaning to the right word.",
    readTime: 5,
    paragraphs: [
      "Identify whether the clue describes a thing, an action, or a quality. Then look for language that narrows the definition, such as how often the action happens or what the object is used for.",
      "For a clue about talking very quietly, write down two candidates such as whisper and murmur. If the clue specifies speaking in someone's ear so others cannot hear, try whisper first.",
    ],
  },
  {
    id: "find-counterexample",
    title: "When a Counterexample Changes the Answer",
    description: "How a single example can rule out an option.",
    readTime: 5,
    paragraphs: [
      "When a logic puzzle asks whether something must be true, look for one arrangement that follows every rule while making the statement false.",
      "Suppose A is left of B and C is right of A. The order A, B, C satisfies both clues and places B in the middle. That one arrangement is enough to show that B does not have to be last.",
    ],
  },
];
