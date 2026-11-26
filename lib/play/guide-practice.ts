import type { playGames } from "./games";

type PracticeExercise = {
  prompt: string;
  answer: string;
  explanation: string;
};

export const guidePractice = {
  "guess-the-movie": [
    {
      prompt: "A storm stalls a tour of an island attraction. Two children are stuck in a vehicle when water in a cup begins to ripple. Moments later, a giant animal steps out of its enclosure. What film is this?",
      answer: "Jurassic Park",
      explanation: "The island tour points to a park built around living dinosaurs. The ripples announce the approaching tyrannosaur in the middle of the stranded tour.",
    },
    {
      prompt: "A London family takes in a bear from Peru after meeting him at a railway station. A museum taxidermist starts looking for the bear. What film is this?",
      answer: "Paddington",
      explanation: "The railway station encounter brings the bear into the Brown household. The museum taxidermist’s pursuit identifies the first film in the series.",
    },
  ],
  "guess-the-book": [
    {
      prompt: "On Christmas Eve, a businessman sees his late business partner dragging a chain. Later visitors show him a family’s holiday meal and a grave marked with his own name. What is the book?",
      answer: "A Christmas Carol",
      explanation: "The man in chains is Jacob Marley. The later visits make Ebenezer Scrooge see both the lives of people around him and the future his choices could bring.",
    },
    {
      prompt: "A mole leaves his spring cleaning to explore a river and befriends a rat who loves boats. They later help a toad reclaim his country house from a band of weasels and their allies. What is the book?",
      answer: "The Wind in the Willows",
      explanation: "Mole meets the Water Rat beside the river. The friends’ later effort to retake Toad Hall connects the two parts of the story.",
    },
  ],
  "guess-the-word": [
    {
      prompt: "Noun. A word or phrase that reads the same in both directions. The teacher wrote “level” on the board as an example of a ____. Enter one English noun.",
      answer: "Palindrome",
      explanation: "Start at either end of “level” and the letters come in the same order. A palindrome has that property, with spaces and punctuation usually ignored in a phrase.",
    },
    {
      prompt: "Verb. To express the meaning of a passage again using different words. The teacher asked me to ____ the sentence in plain English. Enter one ten-letter English verb.",
      answer: "Paraphrase",
      explanation: "To paraphrase is to keep the substance of a statement while changing its wording. The verb fits the blank and contains the requested ten letters.",
    },
  ],
  "guess-the-plant": [
    {
      prompt: "A small houseplant forms a low rosette of fuzzy, rounded leaves. Short stalks hold clusters of purple flowers with five petal-like lobes above the leaves. Enter the two-word English common name.",
      answer: "African violet",
      explanation: "The broad, hairy leaves grow from the base in a rosette. That leaf arrangement and the small showy flowers above it point to the familiar African violet.",
    },
    {
      prompt: "A plant grows flat against a sunny lawn, with sharply toothed leaves in a rosette. Each hollow, leafless stalk carries one yellow head. Later the head becomes a round ball of windborne seeds. Enter the botanical genus.",
      answer: "Taraxacum",
      explanation: "Taraxacum is the genus of dandelions. The toothed basal leaves, solitary heads on hollow stalks, and round seed heads support that identification.",
    },
  ],
  "guess-the-size": [
    {
      prompt: "A ribbon is 1 meter long. Someone cuts 12 cm from each end, then folds the remaining ribbon in half with its ends aligned. How long is the folded ribbon in centimeters?",
      answer: "38 cm",
      explanation: "One meter is 100 cm. The two cuts remove 24 cm, leaving 76 cm. Folding that length in half gives 38 cm.",
    },
    {
      prompt: "A square display has an area of 0.81 square meters. Its frame adds 2 cm outside the display along each edge. What is the full width in centimeters?",
      answer: "94 cm",
      explanation: "The side of the display measures 0.9 m because 0.9 × 0.9 = 0.81. That is 90 cm. The left and right sides of the frame add 2 cm each, bringing the full width to 94 cm.",
    },
  ],
  "yes-or-no": [
    {
      prompt: "There are seven postcards. At least four show a beach, and at least four have a stamp. Must at least one beach postcard have a stamp?",
      answer: "Yes",
      explanation: "Counting the beach cards and then the stamped cards gives at least eight. Since there are seven postcards, at least one must have been counted in both groups.",
    },
    {
      prompt: "Three parcels weigh 12 kg altogether. Each weighs a different positive whole number of kilograms. Must one of the parcels weigh 4 kg?",
      answer: "No",
      explanation: "The parcels could weigh 1 kg, 5 kg, and 6 kg. These are distinct positive whole numbers that add up to 12 kg, so the setup allows a group that omits 4 kg.",
    },
  ],
} as const satisfies Record<(typeof playGames)[number]["slug"], readonly PracticeExercise[]>;
