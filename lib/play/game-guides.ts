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
  strategy: {
    heading: string;
    paragraphs: readonly string[];
  };
  questions: readonly { question: string; answer: string }[];
};

export const gameGuides = {
  "guess-the-movie": {
    heading: "Guess a movie from its plot",
    introduction: "Read a clue about a film’s plot, a character’s goal, or a scene that sets the story apart. Type the title that fits the details. If you get stuck, take another guess, ask for a hint, or reveal the answer to see how the clue points to the film.",
    steps: [
      "Read the clue and pick out a detail that narrows the possible titles.",
      "Enter the film title and select Submit guess. An incorrect guess stays in the field so you can edit it.",
      "Try again, use an available hint, or choose Show answer. Select Next Question after the round ends.",
    ],
    example: {
      prompt: "A television weather reporter travels to a small town for a winter celebration. The morning of the event keeps repeating. What’s the film?",
      answer: "Groundhog Day",
      explanation: "The repeating day gives you the premise. The weather reporter’s assignment to cover the town’s Groundhog Day celebration identifies this particular film.",
    },
    strategy: {
      heading: "Match the setting to the character’s goal",
      paragraphs: [
        "Start with the problem the character has to solve. If the clue mentions a train, ask what must happen before the train reaches its destination. A deadline or a specific goal can narrow the list of films that share the same setting.",
        "Before you submit, test your guess against the smallest detail in the clue. If two adaptations come to mind, check which one contains the scene or event in the question.",
      ],
    },
    questions: [
      {
        question: "Do I need to include the release year?",
        answer: "Enter the movie title by default. If a clue asks for a specific release or remake, use the format shown in the clue, such as Title (Year).",
      },
      {
        question: "Will a shortened title count?",
        answer: "The game accepts the full title and any alternate titles explicitly listed for that question. If a short title is rejected, try the full title, including any subtitle that identifies the film.",
      },
      {
        question: "Can I still solve the clue after taking a hint?",
        answer: "Yes. You can take up to two hints when available. If you solve the clue after using one, the result reads “Correct with a hint!”",
      },
    ],
  },
  "guess-the-book": {
    heading: "Guess a book from its story",
    introduction: "Identify a book from what happens in its story. A clue might describe an unlikely friendship, a decision that changes the plot, or a place a character keeps returning to. Enter the title, then read the explanation after you solve the clue or choose to see the answer.",
    steps: [
      "Read the clue and note who does what and why.",
      "Type the book title and select Submit guess. If the title is incorrect, you can edit it and try again.",
      "Use an available hint or choose Show answer if you get stuck. Select Next Question when you have a result.",
    ],
    example: {
      prompt: "To save a young pig, a barn spider writes words in her web that change how people see him. What’s the book?",
      answer: "Charlotte’s Web",
      explanation: "The spider uses her web to draw attention to the pig. That act of friendship identifies E. B. White’s book.",
    },
    strategy: {
      heading: "Follow a character’s choice to its consequence",
      paragraphs: [
        "A clue about a farm could fit many books. Look for a choice a character makes and what changes because of it. The event that sets a story in motion often narrows the possibilities when the setting is familiar.",
        "If a series comes to mind, think about which volume contains the events in the clue. For a book you know through a screen adaptation, check that your guess also fits the details of the written story.",
      ],
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
        answer: "Yes. Show answer ends the round and displays the book title and the explanation. Select Next Question to continue.",
      },
    ],
  },
  "guess-the-size": {
    heading: "Estimate measurements from written clues",
    introduction: "Work out a size using the measurements and assumptions in a short clue. You might scale up a model, add the widths of repeated parts, or convert units. After your first valid estimate, you can see how close it was and follow the calculation behind the reference value.",
    steps: [
      "Read the clue and note the unit beside the answer field.",
      "Work out an estimate in that unit. Use Show hint before answering if a hint is available.",
      "Select Submit guess, read the reference value and its calculation, then choose Next Question.",
    ],
    example: {
      prompt: "A model bridge is built at 1∶25 scale. One span measures 18 cm on the model. How long is the full-size span in meters?",
      answer: "4.5 m, with an illustrative accepted range of 4.3–4.7 m.",
      explanation: "Multiply 18 cm by 25 to get 450 cm. Divide by 100 to convert centimeters to meters. An estimate of 4.6 m falls within the accepted range.",
    },
    strategy: {
      heading: "Estimate one part at a time",
      paragraphs: [
        "Write down what each number measures. If you need the width of a whole row, work out whether the clue asks you to count the objects, the gaps, or both. Use the stated assumptions to decide what belongs in the calculation.",
        "Carry the units through your calculation. A common slip is to work out the right number in centimeters and enter it for a question that asks for meters. Compare the converted result with a familiar object to catch a misplaced decimal point.",
      ],
    },
    questions: [
      {
        question: "What format should I use for an estimate?",
        answer: "Enter a non-negative number such as 4 or 4.5. Use a decimal point when needed and leave the unit off the end. An invalid entry keeps your chance to answer.",
      },
      {
        question: "How close does my estimate need to be?",
        answer: "Each puzzle has its own accepted range, including both endpoints. The game checks the value you entered before rounding it for display.",
      },
      {
        question: "What happens if my estimate is outside the range?",
        answer: "You see whether it was too low or too high, along with the reference value, accepted range, and explanation. Your first valid estimate completes the round.",
      },
    ],
  },
  "yes-or-no": {
    heading: "Decide what follows from the clues",
    introduction: "Each logic puzzle gives you a set of conditions and a conclusion to test. Decide whether the conclusion holds in every situation that fits the clues. A single valid counterexample is enough for No. After you choose, read the explanation to see which condition decided the answer.",
    steps: [
      "Read the whole setup, paying attention to words such as every, only, and exactly.",
      "Test whether a different outcome could still fit all the conditions. Take a hint first if one is available.",
      "Choose Yes or No. Read the explanation, then select Next Question.",
    ],
    example: {
      prompt: "Three lamps sit in a row. Exactly one is lit. The middle lamp is dark. If the left lamp is lit, the middle lamp is lit. Must the right lamp be lit?",
      answer: "Yes.",
      explanation: "The rule would require the middle lamp to be lit if the left one were lit. Since the middle lamp is dark, the left one is dark too. Exactly one lamp is lit, so it must be the right one.",
    },
    strategy: {
      heading: "Try to build a counterexample",
      paragraphs: [
        "Keep track of which fact starts an if-then rule. A rule that everyone working the closing shift carries a key still allows someone on another shift to carry one. Read each condition in the direction it is given.",
        "If you think the answer is No, write out one concrete situation that keeps every condition true and makes the conclusion false. Check it against each clue before choosing.",
      ],
    },
    questions: [
      {
        question: "What does a No answer mean?",
        answer: "No means that at least one situation fits all the clues and makes the conclusion false. A conclusion that is possible but optional counts as No.",
      },
      {
        question: "Can I change my choice?",
        answer: "Your first choice completes the round. The explanation shows what decided the answer, and Next Question opens another puzzle.",
      },
      {
        question: "Can I see a hint first?",
        answer: "Use Show hint when it is available. The hint may point to the condition worth checking before you decide.",
      },
    ],
  },
} satisfies Record<(typeof playGames)[number]["slug"], GameGuideContent>;
