import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/legal/metadata";
import { playGames } from "@/lib/play/games";
import { site } from "@/lib/site";

export const metadata = pageMetadata(
  "/about",
  "About",
  `About ${site.name}, an independent site for written guessing games and logic puzzles.`,
);

export default function AboutPage() {
  return (
    <StaticPage
      path="/about"
      title={`About ${site.name}`}
      lead="Use written clues to identify movies, books, words, and plants, estimate a measurement, or work through a logic puzzle."
      updated={false}
    >
      <h2>Choose a game</h2>
      <ul>
        {playGames.map((game) => (
          <li key={game.slug}>
            <Link href={`/${game.slug}`}>{game.name}</Link>
            <p>{game.description}</p>
          </li>
        ))}
      </ul>

      <h2>How to play</h2>
      <p>
        Each game explains the answer after you finish a round. Start playing
        without an account or read the <Link href="/how-to-play">rules and FAQ</Link>.
      </p>
      <p>{site.name} is operated independently of guessthe.game.</p>
    </StaticPage>
  );
}
