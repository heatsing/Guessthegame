import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { GamePlayer } from "@/components/play/GamePlayer";
import { findPlayGame, playGames } from "@/lib/play/games";
import { loadGame } from "@/lib/play/service";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

import styles from "./game-page.module.css";

export const viewport: Viewport = {
  themeColor: "#fcfcfb",
};

export async function generateMetadata({ params }: PageProps<"/[game]">): Promise<Metadata> {
  const { game } = await params;
  const config = findPlayGame(game);
  if (!config) notFound();

  return pageMetadata(`/${config.slug}`, `${config.title} | ${site.name}`, config.description, {
    absoluteTitle: true,
  });
}

const difficulties = ["easy", "medium", "hard"];

export default async function GamePage({ params, searchParams }: PageProps<"/[game]">) {
  const { game } = await params;
  const config = findPlayGame(game);
  if (!config) notFound();
  await connection();

  const { topic, difficulty } = await searchParams;
  const selection = {
    topic: typeof topic === "string" && /^[a-z0-9-]{1,80}$/.test(topic) ? topic : undefined,
    difficulty: typeof difficulty === "string" && difficulties.includes(difficulty) ? difficulty : undefined,
  };
  const { round, topics } = await loadGame(config, selection);
  const related = playGames
    .filter(({ slug }) => slug !== config.slug)
    .toSorted((a, b) => Number(b.answerType === config.answerType) - Number(a.answerType === config.answerType));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav aria-label="Site">
          <Link href="/">{site.name}</Link>
          <Link href="/#games">All games</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>{config.name}</h1>
        <GamePlayer
          key={JSON.stringify([config.slug, selection.topic, selection.difficulty])}
          game={config}
          initialRound={round}
          selection={selection}
        />

        <form className={styles.filters} action={`/${config.slug}`} aria-label="Choose questions">
          {topics.length > 1 && (
            <label>
              Topic
              <select name="topic" defaultValue={selection.topic ?? ""}>
                <option value="">All topics</option>
                {topics.map((entry) => <option key={entry.slug} value={entry.slug}>{entry.name}</option>)}
              </select>
            </label>
          )}
          <label>
            Difficulty
            <select name="difficulty" defaultValue={selection.difficulty ?? ""}>
              <option value="">Any difficulty</option>
              {difficulties.map((level) => <option key={level} value={level}>{level[0].toUpperCase() + level.slice(1)}</option>)}
            </select>
          </label>
          <button type="submit">Apply</button>
        </form>

        <section className={styles.section} aria-labelledby="rules">
          <h2 id="rules">How to play</h2>
          <p>{config.rule}</p>
          <details className={styles.example}>
            <summary>Example</summary>
            <p>{config.example}</p>
          </details>
        </section>

        <nav className={styles.section} aria-labelledby="related">
          <h2 id="related">Related games</h2>
          <ul className={styles.related} role="list">
            {related.map((entry) => (
              <li key={entry.slug}><Link href={`/${entry.slug}`}>{entry.name}</Link></li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
