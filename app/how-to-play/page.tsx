import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { StaticPage } from "@/components/StaticPage";
import { HOW_TO_PLAY_FAQS, howToPlayFaqJsonLd } from "@/lib/legal/faq";
import { pageMetadata } from "@/lib/legal/metadata";
import { playGames } from "@/lib/play/games";
import { site } from "@/lib/site";

export const metadata = pageMetadata(
  "/how-to-play",
  "How to play",
  `Learn the rules for title guesses, measurement estimates, and yes-or-no logic puzzles on ${site.name}.`,
);

export default function HowToPlayPage() {
  return (
    <>
      <JsonLd data={howToPlayFaqJsonLd()} />
      <StaticPage
        path="/how-to-play"
        title="How to play"
        lead="Read the clue, submit your answer, and see the explanation. Choose Next Question when you’re ready to play another round."
        updated={false}
      >
        <h2>Game rules</h2>
        {playGames.map((game) => (
          <section key={game.slug}>
            <h3><Link href={`/${game.slug}`}>{game.name}</Link></h3>
            <p>{game.rule}</p>
          </section>
        ))}

        <h2>Frequently asked questions</h2>
        {HOW_TO_PLAY_FAQS.map((faq) => (
          <section key={faq.question}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </section>
        ))}
      </StaticPage>
    </>
  );
}
