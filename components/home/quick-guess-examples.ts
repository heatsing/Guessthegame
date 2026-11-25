export const quickGuessExamples = [
  {
    prompt: "A is left of B. C is right of A. Must B be last?",
    answer: false,
    explanation: "A, B, C fits both clues and puts C last.",
  },
  {
    prompt: "Every blue tile is square. This tile is blue. Must it be square?",
    answer: true,
    explanation: "The rule applies to every blue tile, including this one.",
  },
  {
    prompt: "Mia finished before Leo. Leo finished before Ana. Did Mia finish before Ana?",
    answer: true,
    explanation: "Their order was Mia, Leo, then Ana.",
  },
  {
    prompt: "Some apples are green. This fruit is green. Must it be an apple?",
    answer: false,
    explanation: "The fruit could be a green pear.",
  },
] as const;

export const quickGuessExampleCount = quickGuessExamples.length;
