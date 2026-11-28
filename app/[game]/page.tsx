import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import { GamePlayer } from "@/components/play/GamePlayer";
import { gamePresentation } from "@/lib/game-presentation";
import { gameGuides } from "@/lib/play/game-guides";
import { findPlayGame, playGames } from "@/lib/play/games";
import { loadGame } from "@/lib/play/service";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

import { GameGuide } from "./GameGuide";
import styles from "./game-page.module.css";

export const viewport: Viewport = {
  themeColor: "#f6f7f3",
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
          <Brand className={styles.brand} />
          <div className={styles.navLinks}>
            <Link href="/#games" prefetch={false}>Games</Link>
            <Link href="/blog">Blog</Link>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.play} id="play" aria-labelledby="game-title" tabIndex={-1}>
          <div className={styles.playHeading}>
            <h1 className={styles.title} id="game-title">{config.name}</h1>
            <Image
              alt=""
              className={styles.gameArtwork}
              height={72}
              src={gamePresentation[config.slug].image}
              unoptimized
              width={96}
            />
          </div>
          <GamePlayer
            key={JSON.stringify([config.slug, selection.topic, selection.difficulty])}
            gameSlug={config.slug}
            initialRound={round}
            selection={selection}
          />

          <div className={styles.playTools}>
            <details className={styles.questionFilters} open={Boolean(selection.topic || selection.difficulty)}>
              <summary>Question filters</summary>
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
            </details>
            <a className={styles.rulesLink} href="#rules">How to play</a>
          </div>
        </section>

        <GameGuide game={config} guide={gameGuides[config.slug]} related={related} />
      </main>
      <SiteFooter />
    </div>
  );
}
