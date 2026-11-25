import type { playGames } from "./games";

export type GameGuideContent = {
  heading: string;
  introduction: string;
  steps: readonly string[];
  example: {
    prompt: string;
    answer: string;
    explanation: string;
  };
  questions: readonly { question: string; answer: string }[];
};

export const gameGuides = {
  "guess-the-movie": {
    heading: "Guess a movie from its plot",
    introduction: "Read a clue about a film’s plot, a character’s goal, or a scene that sets the story apart. Type the title that fits the details to check your guess. A matching title unlocks the next clue. If you get stuck, try another guess or ask for a hint.",
    steps: [
      "Read the clue and pick out a detail that narrows the possible titles.",
      "Enter the film title and select Submit guess.",
      "A small spelling slip can count. Check the installment number and any requested release year. Reveal a title to skip it and continue.",
    ],
    example: {
      prompt: "A television weather reporter travels to a small town for a winter celebration. The morning of the event keeps repeating. What’s the film?",
      answer: "Groundhog Day",
      explanation: "The repeating day gives you the premise. The weather reporter’s assignment to cover the town’s Groundhog Day celebration identifies this particular film.",
    },
    questions: [
      {
        question: "Do I need to include the release year?",
        answer: "Enter the movie title by default. If a clue asks for a specific release or remake, use the format shown in the clue, such as Title (Year).",
      },
      {
        question: "Will a shortened title count?",
        answer: "The full title and accepted alternatives count. Minor spelling slips are allowed. Keep the installment number and any requested release year.",
      },
      {
        question: "Can I still solve the clue after taking a hint?",
        answer: "Yes. You can take up to two hints when available. If you solve the clue after using one, the result reads “Correct with a hint!”",
      },
    ],
  },
  "guess-the-book": {
    heading: "Guess a book from its story",
    introduction: "Identify a book from what happens in its story. A clue might describe an unlikely friendship, a decision that changes the plot, or a place a character keeps returning to. Submit the title you think fits. Solve the clue or reveal the title to read the explanation and continue.",
    steps: [
      "Read the clue and note who does what and why.",
      "Type the book title and select Submit guess to check your guess.",
      "If you get stuck, take a hint or reveal the title. Then select Next book.",
    ],
    example: {
      prompt: "To save a young pig, a barn spider writes words in her web that change how people see him. What’s the book?",
      answer: "Charlotte’s Web",
      explanation: "The spider uses her web to draw attention to the pig. That act of friendship identifies E. B. White’s book.",
    },
    questions: [
      {
        question: "Does the apostrophe style in a book title matter?",
        answer: "The checker treats curly and straight apostrophes and quotation marks as equivalent. It also ignores capitalization and extra spaces.",
      },
      {
        question: "Will a translated title be accepted?",
        answer: "A translated title counts when it is listed as an accepted alternate for that question. Try the English title when it’s the one you recognize from the clue.",
      },
      {
        question: "Do I get an explanation if I reveal the title?",
        answer: "Yes. Select Reveal answer to see the title and explanation, then Next book to continue.",
      },
    ],
  },
  "guess-the-size": {
    heading: "Estimate measurements from written clues",
    introduction: "Work out a size using the measurements and assumptions in a short clue. You might scale up a model, add the widths of repeated parts, or convert units. Each clue has an accepted range. Land inside it to see the reference value and calculation.",
    steps: [
      "Read the clue and note the unit beside the answer field.",
      "Work out an estimate in that unit. Use Show hint before answering if a hint is available.",
      "Submit your estimate. Use Too high or Too low to adjust and try again.",
    ],
    example: {
      prompt: "A model bridge is built at 1∶25 scale. One span measures 18 cm on the model. How long is the full-size span in meters?",
      answer: "4.5 m.",
      explanation: "Multiply 18 cm by 25 to get 450 cm. Divide by 100 to convert centimeters to meters. An estimate of 4.95 m is 10% off, so it scores 90%.",
    },
    questions: [
      {
        question: "What format should I use for an estimate?",
        answer: "Enter a non-negative number such as 4 or 4.5. Use a decimal point when needed and leave the unit off the end. An invalid entry keeps your chance to answer.",
      },
      {
        question: "How close does my estimate need to be?",
        answer: "Each question has its own accepted range, including both endpoints. Your accuracy shows how close you were to the reference value.",
      },
      {
        question: "What happens if my estimate falls outside the range?",
        answer: "You get a directional hint and another try. Once you land within the range, you see the reference value and explanation.",
      },
    ],
  },
  "yes-or-no": {
    heading: "Decide what follows from the clues",
    introduction: "Each logic puzzle gives you a set of conditions and a conclusion to test. Decide whether the conclusion holds in every situation that fits the clues. A single valid counterexample is enough for No. Your first choice opens the explanation.",
    steps: [
      "Read the whole setup, paying attention to words such as every, only, and exactly.",
      "Test whether a different outcome could still fit all the conditions. Take a hint first if one is available.",
      "Choose Yes or No once. Read the reasoning, then continue to the next question.",
    ],
    example: {
      prompt: "Three lamps sit in a row. Exactly one is lit. The middle lamp is dark. If the left lamp is lit, the middle lamp is lit. Must the right lamp be lit?",
      answer: "Yes.",
      explanation: "The rule would require the middle lamp to be lit if the left one were lit. Since the middle lamp is dark, the left one is dark too. Exactly one lamp is lit, so it must be the right one.",
    },
    questions: [
      {
        question: "What does a No answer mean?",
        answer: "No means that at least one situation fits all the clues and makes the conclusion false. A conclusion that is possible but optional counts as No.",
      },
      {
        question: "Can I change my choice?",
        answer: "Each puzzle records your first choice. Either choice opens the explanation and lets you continue.",
      },
      {
        question: "Can I see a hint first?",
        answer: "Use Show hint when it is available. The hint may point to the condition worth checking before you decide.",
      },
    ],
  },
} satisfies Record<(typeof playGames)[number]["slug"], GameGuideContent>;
