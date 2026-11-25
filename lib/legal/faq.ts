export type HowToPlayFaq = {
  question: string;
  answer: string;
};

export const HOW_TO_PLAY_FAQS: readonly HowToPlayFaq[] = [
  {
    question: "How are title and word guesses checked?",
    answer:
      "The game compares your spelling to the answer and recognized alternatives. Capitalization and extra spaces are ignored. Follow the clue when it specifies a release year or a word form.",
  },
  {
    question: "What can I enter for a size estimate?",
    answer:
      "Enter a non-negative whole number or decimal such as 125 or 1.5. Use the unit shown next to the answer field. Your accuracy is based on the percentage difference from the reference value.",
  },
  {
    question: "How do I unlock the next question?",
    answer:
      "Score more than 80% to advance on an estimate or a text guess. You can reveal a book title to skip straight to the next book after reading the explanation. In Yes or No?, your first choice reveals the reasoning and opens the next puzzle.",
  },
  {
    question: "Do I need an account?",
    answer:
      "You can play without an account. The game uses a randomly generated session ID to recognize your round.",
  },
  {
    question: "Can I continue after refreshing?",
    answer:
      "With browser storage enabled, refresh the same game and filters in the same tab to restore your current round, including the hints and any result you saw.",
  },
  {
    question: "Do I need JavaScript?",
    answer:
      "The game controls use JavaScript to check answers and load the next question. You can read the game rules and browse the site with JavaScript disabled.",
  },
];

export function howToPlayFaqJsonLd(faqs: readonly HowToPlayFaq[] = HOW_TO_PLAY_FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
