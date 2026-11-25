import type { playGames } from "./play/games";

type GameSlug = (typeof playGames)[number]["slug"];
export type GuidePost = {
  slug: string;
  title: string;
  summary: string;
  game?: GameSlug;
  sections: { heading: string; paragraphs: string[] }[];
  exercise: { prompt: string; answer: string };
};

export const posts: GuidePost[] = [
  {
    slug: "how-to-read-a-movie-plot-clue", game: "guess-the-movie",
    title: "How to Read a Movie Plot Clue",
    summary: "When two films share a premise, one small detail can tell you which title to enter.",
    sections: [
      { heading: "Follow the character with the problem", paragraphs: [
        "Suppose a clue opens with a family forgetting something on its way to the airport. That could be the beginning of a dozen holiday comedies. Ask who faces the consequences. A child waking up to an empty house gives you a much better lead than a parent running for a flight.",
        "Retell the clue in a short sentence that joins an action to its consequence. The family leaves a child behind, so he has to protect the house himself. That sentence gives you something to test when a title comes to mind."
      ] },
      { heading: "Use the detail that separates two films", paragraphs: [
        "The first two Home Alone films both feature Kevin, a holiday trip and the same burglars. A clue about defending his family home points to the first film. A hotel stay after catching the wrong flight points to the second. Knowing the series gets you close, but the setting identifies the installment.",
        "If the clue asks for a year, look for the detail that identifies that release. Otherwise start with the title. Save a hint for the moment when you can name two candidates and explain exactly what you need to tell them apart."
      ] }
    ],
    exercise: { prompt: "A boy spends Christmas apart from his family. He uses his father’s credit card to check into a New York hotel. Which installment fits?", answer: "Home Alone 2: Lost in New York. The hotel narrows the choice more than Christmas or the missing family." }
  },
  {
    slug: "how-to-guess-a-book-from-story-clues", game: "guess-the-book",
    title: "How to Guess a Book from Story Clues",
    summary: "Trace who acts, what changes, and which book in a series contains that event.",
    sections: [
      { heading: "Look for a decision you remember", paragraphs: [
        "A farm, a young animal and a worried child sound familiar even if you have forgotten the title. The deciding detail might be a spider choosing words to write in a web. Try turning the clue into a question about an action. Who did something surprising, and whom did it help?",
        "This works with mysteries too. A strange animal on a moor gives you the atmosphere. A doctor traveling ahead of a famous detective gives you a relationship you can recognize. Take those two clues together before guessing."
      ] },
      { heading: "Separate the book from its series", paragraphs: [
        "If the first name that comes to mind is a detective or a series, keep it as a working guess. Look back for the object, journey or case that belongs to one volume. Enter that volume’s title when the question asks for a book.",
        "Remembering a film adaptation can give you a starting point. Check the clue for one event you also remember from the book. A cover illustration, actor or film subtitle may feel familiar while pointing you to the wrong title."
      ] }
    ],
    exercise: { prompt: "A sailor leaves behind a map. On the voyage that follows, a boy hiding in an apple barrel overhears the cook discussing mutiny. Which book fits?", answer: "Treasure Island. The apple barrel and the ship’s cook identify Jim Hawkins’s voyage much more closely than the map alone." }
  },
  {
    slug: "how-to-estimate-size-from-a-familiar-object", game: "guess-the-size",
    title: "How to Estimate Size from a Familiar Object",
    summary: "Choose a reference, count the gaps, and keep the unit attached to the answer.",
    sections: [
      { heading: "Pick a reference that runs in the same direction", paragraphs: [
        "Imagine looking across a shelf with four identical paperback books laid flat along its front edge. If each book measures 13 centimeters across, the books account for about 52 centimeters of shelf. Their thickness tells you little about that horizontal distance.",
        "When a clue supplies a measurement, use it even if an object you own is a different size. If you are estimating by eye, choose something you have actually measured. The short side of your own notebook makes a better reference than a guess about the average notebook."
      ] },
      { heading: "Count the spaces separately", paragraphs: [
        "Put four books in a row and count the places where two neighbors meet. There are three. With 2 centimeters between neighboring books, the total becomes 52 plus 6, or 58 centimeters. Add end margins only when the question includes them.",
        "Before submitting, read the unit next to the input. The same shelf can be 58 centimeters or 0.58 meters. A reply of Too low or Too high tells you which way to adjust. If the gap seems enormous, check your unit before you redo the arithmetic."
      ] }
    ],
    exercise: { prompt: "Five tiles are each 8 cm wide. Each pair of neighbors has a 1 cm gap. How wide is the row, ignoring the outside edges?", answer: "44 cm. The five tiles contribute 40 cm, and the four gaps add another 4 cm." }
  },
  {
    slug: "how-to-find-a-counterexample", game: "yes-or-no",
    title: "How to Find a Counterexample in a Logic Puzzle",
    summary: "Test whether a conclusion must hold by building one arrangement that follows every rule.",
    sections: [
      { heading: "Give the word “must” some weight", paragraphs: [
        "Suppose every blue ticket admits one guest and Lee got inside. A blue ticket would explain Lee’s entry. The question is whether it is the only possible explanation. Nothing in the rule prevents a guest list from admitting people too.",
        "Try telling one short story in which the rule holds and the proposed conclusion fails. Lee was on the guest list and had no blue ticket. Every blue ticket still admits a guest. That is enough to answer No."
      ] },
      { heading: "Check your example against every condition", paragraphs: [
        "For a position puzzle, write the names in order. If A must be left of B and C must be right of A, try A, B, C. It obeys both rules and puts B in the middle. This single arrangement settles the question of whether B must be last.",
        "A proposed counterexample is useful only if it obeys the original rules. Add the condition that C is left of B, and the same arrangement fails. With three positions and both A and C to its left, B now has to be last."
      ] }
    ],
    exercise: { prompt: "Everyone in the choir has a key. Morgan has a key. Must Morgan belong to the choir?", answer: "No. Morgan could be the caretaker. That leaves the rule about every choir member intact." }
  },
  {
    slug: "how-to-find-a-word-from-its-definition", game: "guess-the-word",
    title: "How to Find a Word from Its Definition",
    summary: "Test two possible words in the same sentence and listen for the detail that changes the meaning.",
    sections: [
      { heading: "Identify the job the word does", paragraphs: [
        "A clue that begins “to speak” is asking for a verb. A clue that begins “a short, quiet sound” is asking for a noun. Put a blank into an ordinary sentence before listing candidates. “She began to ___ so the baby would stay asleep” rules out quite a few words.",
        "Now compare the candidates in context. Both murmur and whisper can fit a quiet room. If the clue adds that the speaker directs the words into someone’s ear, whisper is a stronger guess."
      ] },
      { heading: "Keep the small restriction", paragraphs: [
        "A definition often starts broad and places its most useful detail at the end. Look at the difference between “to look” and “to look briefly.” The second phrase makes glance a better candidate than stare.",
        "Try inventing a sentence where one candidate sounds wrong. Someone can stare out of a window for ten minutes. Saying they glanced for ten minutes clashes with the brief action the clue describes."
      ] }
    ],
    exercise: { prompt: "Which verb fits a single, quick look at a clock before a meeting?", answer: "Glance. The time spent looking is the detail that distinguishes it from studying or watching the clock." }
  }
];

export function blogPath(post: GuidePost) {
  return `/blog/${post.slug}`;
}
