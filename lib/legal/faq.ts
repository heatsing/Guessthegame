export type HowToPlayFaq = {
  question: string;
  answer: string;
};

export const HOW_TO_PLAY_FAQS: readonly HowToPlayFaq[] = [
  {
    question: "How many guesses do I get?",
    answer:
      "Six. Each wrong guess or Skip reveals the next screenshot, up to six shots. A new ThemeShot arrives at 00:00 UTC.",
  },
  {
    question: "What does Skip do?",
    answer:
      "Skip uses one of your six guesses and reveals the next screenshot without submitting a title. Use it when you need another look more than a guess.",
  },
  {
    question: "When does the puzzle reset?",
    answer:
      "Every day at 00:00 UTC. Dates on the site, including Archive, use the UTC calendar — not your local midnight.",
  },
  {
    question: "Is GuessTheGame.net the same as guessthe.game?",
    answer:
      "No. GuessTheGame.net is an independent ThemeShot Daily site. It is not affiliated with, endorsed by, or the same product as guessthe.game.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. There is no login. Play, streak, and guess distribution stay in this browser's localStorage. Nothing is uploaded to an account.",
  },
  {
    question: "Are my stats saved in the cloud?",
    answer:
      "No. Stats live only on this device under the themeshot.daily.v1 key. Clearing site data or switching browsers resets them.",
  },
  {
    question: "Can I play past puzzles?",
    answer:
      "Yes. Open Archive for the last 30 already-open published days. Historical /puzzle pages reuse the same rules and are not indexed.",
  },
  {
    question: "Why is JavaScript required to play?",
    answer:
      "The answer is loaded in the browser after JavaScript runs so the initial HTML does not contain the title. Rules, FAQ, and legal pages are readable without JavaScript.",
  },
  {
    question: "Will there be ads?",
    answer:
      "Not in this MVP. Ads stay off until screenshot rights coverage is high enough. This site does not show extra modes or an app store listing either.",
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
