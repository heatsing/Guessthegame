import type { playGames } from "./games";

type GuideLesson = {
  heading: string;
  steps: readonly { title: string; detail: string }[];
};

export const guideLessons = {
  "guess-the-movie": {
    heading: "Reconstruct the scene",
    steps: [
      {
        title: "Put the events in order",
        detail: "Retell the clue in two or three short beats. If someone hides an envelope before a visitor arrives, keep both that order and who knows about the envelope. A familiar scene with those events reversed belongs lower on your list.",
      },
      {
        title: "Separate what you see from what you infer",
        detail: "Make a list of facts the clue states, then mark the connections you supplied. A uniform can suggest a job. The character’s actions can tell you whether they actually hold that job or are wearing a disguise.",
      },
      {
        title: "Ask what an object does in the story",
        detail: "A memorable prop can appear in several films. Recall who finds it, who wants it, and what changes when it moves between them. A prop used to pass a message gives you a more specific memory to search than its appearance alone.",
      },
    ],
  },
  "guess-the-book": {
    heading: "Build a short list from the story",
    steps: [
      {
        title: "Notice whose account you are reading",
        detail: "Check who witnessed the event and how the reader learns about it. A story told through a character’s account years later has a different structure from a scene the reader sees as it happens. Use that distinction when two plots sound alike.",
      },
      {
        title: "Track an object across the story",
        detail: "Pick an object the clue mentions and trace who handles it first, who receives it, and how it changes what a character knows. A letter can carry an invitation, a warning, or a confession. Its purpose can bring a particular chapter to mind.",
      },
      {
        title: "Place the scene in the plot",
        detail: "Decide whether the event opens the story, changes the characters’ plans, or resolves a problem. Locate the same event in the book you remember. A discovery in the opening chapter and a discovery at the end play different roles in the story.",
      },
    ],
  },
  "guess-the-word": {
    heading: "Compare possible words in context",
    steps: [
      {
        title: "Restate the definition and keep its limits",
        detail: "Put the definition into simpler words and keep details such as deliberately, repeatedly, or for a short time. These words often separate a general action from a specific one. Use your short version to come up with two or three candidates.",
      },
      {
        title: "Check which words go together",
        detail: "Look at any preposition, adverb, or object beside the blank. Read the sentence aloud with each candidate in place. A word that calls for an extra preposition may express the right idea in a different sentence.",
      },
      {
        title: "Compare tone and intensity",
        detail: "When two candidates both fit grammatically, ask what each one adds to the meaning. They may differ in how forceful, formal, or deliberate they sound. Match that difference to a word or phrase in the definition.",
      },
    ],
  },
  "guess-the-plant": {
    heading: "Read the description like a field note",
    steps: [
      {
        title: "Match the season or growth stage",
        detail: "Check when each feature is described. If the clue describes the plant in winter, start with features you would still see then, such as stems or bark. Keep seasonal descriptions attached to the time of year given in the clue.",
      },
      {
        title: "Sketch where the parts attach",
        detail: "Draw a stem and mark where the leaves, branches, or flowers sit. A pair of leaves at one point and single leaves at successive points produce different sketches. This is useful when the plants you remember have similarly shaped leaves.",
      },
      {
        title: "Check what the setting tells you",
        detail: "Note whether the clue describes a plant growing wild or one planted in a garden. A plant can be cultivated far from its native habitat. Keep the setting alongside the visible traits before you settle on an identification.",
      },
    ],
  },
  "guess-the-size": {
    heading: "Build and check an estimate",
    steps: [
      {
        title: "Choose the operation from what you are measuring",
        detail: "Draw the arrangement and label the measurement the clue asks for. A line of objects usually calls for adding lengths along one axis. To work out how much space a rectangular surface covers, multiply its length by its width.",
      },
      {
        title: "Make an upper and lower estimate",
        detail: "For positive measurements you plan to multiply, round each input down once and up once. Work out both totals using those rounded values. Your answer should fall between them, which gives you a quick way to catch arithmetic mistakes.",
      },
      {
        title: "Round the result at the end",
        detail: "Keep the stated measurements in your working, especially when one value will be used many times. Rounding 3.8 centimeters to 4 centimeters seems small for one piece. After 24 pieces, it adds 4.8 centimeters to the estimate.",
      },
    ],
  },
  "yes-or-no": {
    heading: "Test how the rules fit together",
    steps: [
      {
        title: "Label the group each rule applies to",
        detail: "Write down the people, objects, or events named in each statement. Keep the group label next to the rule as you combine it with others. Before applying a rule about club members to the person named in the conclusion, find the clue that establishes their membership.",
      },
      {
        title: "Work through one case at a time",
        detail: "If two people could hold a role, make a row for each possibility. Copy the established facts into both rows, then apply each rule and cross out any impossible case. Check the proposed conclusion against every row left on the page.",
      },
      {
        title: "Find the unstated rule you may have added",
        detail: "Review your reasoning for a step you filled in from everyday expectations. For example, if the clue names three entrants, check whether it says they are the only entrants. Use the exact wording to decide which additional cases are allowed.",
      },
    ],
  },
} as const satisfies Record<(typeof playGames)[number]["slug"], GuideLesson>;
