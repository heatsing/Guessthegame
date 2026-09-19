import Link from "next/link";

import { JsonLd } from "@/components/JsonLd";
import { StaticPage } from "@/components/StaticPage";
import { HOW_TO_PLAY_FAQS, howToPlayFaqJsonLd } from "@/lib/legal/faq";
import { pageMetadata } from "@/lib/legal/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata(
  "/how-to-play",
  "How to play",
  `Rules and FAQ for ${site.name} ThemeShot Daily: six screenshots, six guesses, Skip, and a new puzzle at 00:00 UTC.`,
);

export default function HowToPlayPage() {
  return (
    <>
      <JsonLd data={howToPlayFaqJsonLd()} />
      <StaticPage
        path="/how-to-play"
        title="How to play"
        lead="One curated screenshot puzzle each UTC day. Guess the game. No extra modes."
        updated={false}
      >
        <h2>Rules</h2>
        <ol>
          <li>Look at today&apos;s ThemeShot screenshot.</li>
          <li>
            Type a game title. Catalog suggestions (English, Chinese, and
            Japanese names) appear as you type.
          </li>
          <li>
            A wrong guess or Skip reveals the next shot — up to six screenshots.
          </li>
          <li>
            You have six guesses. A new puzzle arrives at 00:00 UTC.
          </li>
          <li>
            Copy a spoiler-free result when you finish. The share text never
            includes the game title.
          </li>
          <li>
            Open Stats for your local streak and guess distribution. Nothing is
            uploaded.
          </li>
          <li>
            Missed a day? Replay recent ThemeShots from the{" "}
            <Link href="/archive">Archive</Link>. Historical puzzle pages are
            not indexed.
          </li>
        </ol>

        <h2>Tips</h2>
        <ul>
          <li>
            Play on{" "}
            <Link href="/">today&apos;s puzzle</Link> first. Archive dates use
            the same six-shot, six-guess loop.
          </li>
          <li>
            Skip spends a guess. Use it when another screenshot will help more
            than a blind title.
          </li>
          <li>
            The initial HTML does not contain the answer. JavaScript is
            required to play; it is not required to read this page.
          </li>
        </ul>

        <h2>FAQ</h2>
        {HOW_TO_PLAY_FAQS.map((faq) => (
          <section key={faq.question}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </section>
        ))}

        <p>
          {site.name} is {site.product}. Read the{" "}
          <Link href="/about">About</Link> page for how this site differs from
          guessthe.game.
        </p>
      </StaticPage>
    </>
  );
}
