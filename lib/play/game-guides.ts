import type { playGames } from "./games";
import { sizeRule } from "./result";

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
    introduction: "Read a clue about a film’s plot, a character’s goal, or a scene that sets the story apart. Type the title that fits the details to see its accuracy. A score above 80% unlocks the next clue. If you get stuck, try another guess or ask for a hint.",
    steps: [
      "Read the clue and pick out a detail that narrows the possible titles.",
      "Enter the film title and select Submit guess to see how closely it matches.",
      "Edit your title or use an available hint. Choose Reveal answer to skip the clue and continue, or score above 80% to solve it.",
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
        answer: "The full title and listed alternatives score 100%. Other guesses are scored by spelling similarity. If a shortened title scores too low, try the full title, including its subtitle.",
      },
      {
        question: "Can I still solve the clue after taking a hint?",
        answer: "Yes. You can take up to two hints when available. If you solve the clue after using one, the result reads “Correct with a hint!”",
      },
    ],
  },
  "guess-the-book": {
    heading: "Guess a book from its story",
    introduction: "Identify a book from what happens in its story. A clue might describe an unlikely friendship, a decision that changes the plot, or a place a character keeps returning to. Submit the title you think fits. A score above 80% reveals the explanation and unlocks the next clue.",
    steps: [
      "Read the clue and note who does what and why.",
      "Type the book title and select Submit guess to see its accuracy.",
      "Score above 80% to finish the clue, or select Reveal answer to skip it. Choose Next book to continue.",
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
        answer: "Yes. Reveal answer marks the question as skipped and shows the title and explanation. Select Next book to continue.",
      },
    ],
  },
  "guess-the-word": {
    heading: "Guess an English word from its definition",
    introduction: "Read a short definition and use the part of speech and sentence to find the word that fits. Submit your guess to see its spelling accuracy. A score above 80% unlocks the explanation and the next clue. You can edit your guess or use an available hint along the way.",
    steps: [
      "Read the definition and sentence. Check the part of speech and any requested spelling or word form.",
      "Enter one English word and select Submit guess to see its accuracy from 0% to 100%.",
      "Score above 80% to unlock Next Question. At 80% or below, edit your guess or use an available hint.",
    ],
    example: {
      prompt: "Noun. An old writing surface reused after its first text was rubbed away. The scholar noticed fragments of earlier writing beneath the newer text on the ____. What is the word?",
      answer: "Palimpsest",
      explanation: "The surface was used for more than one text, and traces of the earlier writing remain. The guess “palimsest” leaves one letter out of the ten-letter answer and scores 90%.",
    },
    strategy: {
      heading: "Check the meaning and the word form",
      paragraphs: [
        "Read the sentence with your candidate in the blank. Use the part-of-speech label to check how the word works, then see whether the surrounding words call for a specific tense or a singular or plural form.",
        "If several words fit the sentence, return to the most specific detail in the definition. When a guess scores near the threshold, check for a missing letter or a different ending before trying another word.",
      ],
    },
    questions: [
      {
        question: "How is my word guess scored?",
        answer: "The exact spelling and listed alternatives score 100%. Other guesses are scored by the spelling changes needed to reach the answer. You need a score above 80% to advance.",
      },
      {
        question: "Which spelling or word form should I use?",
        answer: "Follow the clue if it asks for a singular, a plural, or a regional spelling. A listed alternative spelling also scores 100%.",
      },
      {
        question: "What happens if I use a hint or reveal the answer?",
        answer: "A hint adds another clue and leaves the question open. Show answer and end run displays the word and explanation. You can then start a new run at Question 1.",
      },
    ],
  },
  "guess-the-plant": {
    heading: "Identify a plant from written clues",
    introduction: "Read a short description and use details such as leaf shape, growth habit, and habitat to narrow your guess. The clue tells you whether to enter a common name, a genus, or a scientific species name. Submit your answer to see how closely the spelling matches.",
    steps: [
      "Read the whole clue and check the requested name format.",
      "Type the plant name and select Submit guess to see its accuracy from 0% to 100%.",
      "Score above 80% to unlock Next Question. At 80% or below, edit your guess or use an available hint.",
    ],
    example: {
      prompt: "Give the English common name. This tree loses its leaves each year. Its broad leaves open like fans and often have a notch in the outer edge. The veins fork as they spread from the stalk, and the leaves turn gold before they fall. What tree is it?",
      answer: "Ginkgo",
      explanation: "The fan-shaped leaves and branching veins point to ginkgo, also called the maidenhair tree. The notch in the leaf and the gold autumn color support the identification.",
    },
    strategy: {
      heading: "Start with the most distinctive trait",
      paragraphs: [
        "Notice how the plant grows. It may climb, spread in a low patch, or grow upright. Then look for a more specific feature, such as the shape of the leaves or whether they grow opposite one another.",
        "Use the habitat to narrow your choices, then check each candidate against the other clues. An unusual leaf shape or the way flowers are grouped can be more useful than a color shared by many plants.",
      ],
    },
    questions: [
      {
        question: "Should I use the common name or scientific name?",
        answer: "Follow the format in the clue. Enter one word when asked for the genus. Enter both words when asked for a scientific species name, such as Ginkgo biloba.",
      },
      {
        question: "Will another spelling or common name count?",
        answer: "The exact answer and listed alternatives score 100%. Other guesses are scored by spelling similarity. A score above 80% advances the run.",
      },
      {
        question: "Can I use a hint or reveal the plant?",
        answer: "You can use up to two hints and keep guessing. Show answer and end run reveals the plant name and explanation. You can then start another run from Question 1.",
      },
    ],
  },
  "guess-the-size": {
    heading: "Estimate measurements from written clues",
    introduction: "Work out a size using the measurements and assumptions in a short clue. You might scale up a model, add the widths of repeated parts, or convert units. Every valid estimate shows its accuracy. Score above 80% to see the reference value and calculation.",
    steps: [
      "Read the clue and note the unit beside the answer field.",
      "Work out an estimate in that unit. Use Show hint before answering if a hint is available.",
      "Select Submit guess and check your accuracy. Adjust your estimate if it scores 80% or less.",
    ],
    example: {
      prompt: "A model bridge is built at 1∶25 scale. One span measures 18 cm on the model. How long is the full-size span in meters?",
      answer: "4.5 m.",
      explanation: "Multiply 18 cm by 25 to get 450 cm. Divide by 100 to convert centimeters to meters. An estimate of 4.95 m is 10% off, so it scores 90%.",
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
        answer: sizeRule,
      },
      {
        question: "What happens if my accuracy is too low?",
        answer: "You see your score and whether the estimate was too low or too high. Adjust your estimate and try again. A passing score shows the reference value and explanation.",
      },
    ],
  },
  "yes-or-no": {
    heading: "Decide what follows from the clues",
    introduction: "Each logic puzzle gives you a set of conditions and a conclusion to test. Decide whether the conclusion holds in every situation that fits the clues. A single valid counterexample is enough for No. After your first choice, you can read the reasoning and move on.",
    steps: [
      "Read the whole setup, paying attention to words such as every, only, and exactly.",
      "Test whether a different outcome could still fit all the conditions. Take a hint first if one is available.",
      "Choose Yes or No once. Read the reasoning or counterexample, then select Next puzzle.",
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
        answer: "Your first choice is final. You get the explanation and can move to the next puzzle after either answer.",
      },
      {
        question: "Can I see a hint first?",
        answer: "Use Show hint when it is available. The hint may point to the condition worth checking before you decide.",
      },
    ],
  },
} satisfies Record<(typeof playGames)[number]["slug"], GameGuideContent>;
