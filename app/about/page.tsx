import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/legal/metadata";
import { site } from "@/lib/site";

export const metadata = pageMetadata(
  "/about",
  "About",
  `${site.name} is ${site.product}, an independent daily screenshot puzzle. Not affiliated with guessthe.game.`,
);

export default function AboutPage() {
  return (
    <StaticPage
      path="/about"
      title="About ThemeShot Daily"
      lead={`${site.name} is ${site.product}: one curated screenshot puzzle each day. Not affiliated with guessthe.game.`}
    >
      <h2>What this site is</h2>
      <p>
        {site.name} publishes {site.product}, a daily guessing puzzle. You see
        a curated screenshot (a ThemeShot), type a game title, and work through
        up to six shots and six guesses. A new puzzle opens at 00:00 UTC.
      </p>
      <p>
        The product is intentionally small: no ads in this MVP, no extra modes,
        no account, and no app. Stats and streak stay in this browser. Missed
        days live on the <Link href="/archive">Archive</Link>.
      </p>

      <h2>Not affiliated with guessthe.game</h2>
      <p>
        {site.name} is an independent site. It is not guessthe.game, not a
        mirror of that site, and not affiliated with, endorsed by, or operated
        by the people behind guessthe.game.
      </p>
      <p>
        The domain, product name, and loop are different. We use{" "}
        <strong>GuessTheGame.net</strong> as the site name and{" "}
        <strong>ThemeShot Daily</strong> as the product: one press-kit-style
        screenshot puzzle per UTC day, with self-hosted images and recorded
        rights fields.
      </p>
      <p>{site.disclaimer}</p>

      <h2>How we source puzzles</h2>
      <p>
        Game titles and related metadata may include data from{" "}
        <a href={site.rawg.url} rel="noopener noreferrer">
          {site.rawg.name}
        </a>
        . {site.rawg.name} does not grant screenshot or artwork rights.
        ThemeShot images are self-hosted. We prefer official press kits with
        permission to use stills on a daily puzzle site.
      </p>
      <p>
        See <Link href="/copyright">Copyright</Link> and{" "}
        <Link href="/dmca">DMCA</Link> if you own rights in an image we used.
      </p>

      <h2>How to play</h2>
      <p>
        Full rules and FAQ: <Link href="/how-to-play">How to play</Link>. Play{" "}
        <Link href="/">today&apos;s ThemeShot</Link>.
      </p>
    </StaticPage>
  );
}
