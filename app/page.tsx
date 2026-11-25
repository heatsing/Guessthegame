import type { Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { QuickGuess } from "@/components/home/QuickGuess";
import { quickGuessExampleCount } from "@/components/home/quick-guess-examples";
import { guessingGames } from "@/lib/guessing-games";
import {
  browseTopics,
  featuredChallenge,
  guessingGuides,
  topicPicks,
  type HomeGuide,
} from "@/lib/home-guides";
import { legalNav } from "@/lib/legal/nav";
import { isPlayablePath } from "@/lib/play/games";
import { homeDescription, homeTitle, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

import styles from "./home.module.css";

export const metadata = pageMetadata("/", homeTitle, homeDescription, {
  absoluteTitle: true,
});

export const viewport: Viewport = {
  themeColor: "#fcfcfb",
};

const dateLabel = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeZone: "Asia/Shanghai",
});

const dateAttribute = new Intl.DateTimeFormat("en-CA", {
  dateStyle: "short",
  timeZone: "Asia/Shanghai",
});

const iconPaths = {
  movie: "M3 10h18v10H3zM3 10l-1-4 18-3 1 4zM7 5l3 4m3-5 3 4m-4 6v3l3-1.5z",
  book: "M12 5c-2.5-2-6-2.5-10-1v14c4-1.5 7.5-1 10 1 2.5-2 6-2.5 10-1V4c-4-1.5-7.5-1-10 1Zm0 0v14",
  plant: "M12 21v-8m0 3C5 16 3 12 3 8c5 0 9 2 9 8Zm0-3c0-6 4-9 9-9 0 5-3 9-9 9Z",
  size: "m3 16 13-13 5 5L8 21zM6 13l2 2m1-5 2 2m1-5 2 2m1-5 2 2",
  logic: "m4 12 5 5L20 6",
  shuffle: "M3 6h2c4 0 6 12 10 12h5m-4-4 4 4-4 4M3 18h2c4 0 6-12 10-12h5m-4-4 4 4-4 4",
};

type GameArt = Exclude<keyof typeof iconPaths, "shuffle"> | "word";

const gameArt: Partial<Record<string, GameArt>> = {
  "/guess-the-movie/": "movie",
  "/guess-the-book/": "book",
  "/guess-the-word/": "word",
  "/guess-the-plant/": "plant",
  "/guess-the-size/": "size",
  "/yes-or-no/": "logic",
};

function Icon({ kind }: { kind: GameArt | "shuffle" }) {
  if (kind === "word") return <span aria-hidden="true">Aa</span>;

  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[kind]} />
    </svg>
  );
}

function GameBadge({ kind, soft = false }: { kind: GameArt; soft?: boolean }) {
  return (
    <span className={`${styles.badge} ${styles[kind]} ${soft ? styles.soft : ""}`}>
      <Icon kind={kind} />
    </span>
  );
}

function Brand() {
  return (
    <Link className={styles.brand} href="/" prefetch={false}>
      <span className={styles.brandMark} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      {site.name}
    </Link>
  );
}

function Photo({
  name,
  wide = false,
  eager = false,
}: {
  name: string;
  wide?: boolean;
  eager?: boolean;
}) {
  return (
    <Image
      className={styles.photo}
      src={`/home/${name}.webp`}
      alt=""
      width={wide ? 864 : 480}
      height={wide ? 320 : 360}
      loading={eager ? "eager" : "lazy"}
      unoptimized
    />
  );
}

function GameCard({
  game,
  eager,
}: {
  game: (typeof guessingGames)[number];
  eager: boolean;
}) {
  const art = gameArt[game.path];
  const playable = isPlayablePath(game.path);
  const content = (
    <>
      {art ? (
        <Photo name={art} eager={eager} />
      ) : (
        <span className={styles.placeholder} aria-hidden="true">?</span>
      )}
      <span className={styles.gameCaption}>
        {art && <GameBadge kind={art} />}
        <span>
          <strong>{game.name}</strong>
          <span className={styles.caption}>{playable ? game.description : "Coming soon"}</span>
        </span>
      </span>
    </>
  );

  return playable
    ? <a className={styles.gameCard} href={game.path}>{content}</a>
    : <div className={styles.gameCard}>{content}</div>;
}

function ArticleCard({
  article,
  photo,
  wide = false,
}: {
  article: HomeGuide;
  photo?: string;
  wide?: boolean;
}) {
  return (
    <details className={styles.article} id={article.id}>
      <summary>
        {photo && <Photo name={photo} wide={wide} />}
        <span className={styles.articleTitle}>{article.title}</span>
        <span className={styles.caption}>
          {article.description} <span className={styles.dot} aria-hidden="true">·</span>{" "}
          <span className={styles.readTime}>{article.readTime} min read</span>
        </span>
      </summary>
      <div className={styles.articleBody}>
        {article.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </details>
  );
}

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

export default async function Home({ searchParams }: PageProps<"/">) {
  await connection();

  const { quick } = await searchParams;
  const quickGuessIndex = quick === "another" ? 1 + randomIndex(quickGuessExampleCount - 1) : 0;
  const now = new Date();
  const games = guessingGames.toSorted((a, b) => a.order - b.order);
  const playableGames = games.filter(({ path }) => isPlayablePath(path));
  const [leadGuide, ...otherGuides] = guessingGuides;

  return (
    <div className={styles.page}>
      <header className={styles.container}>
        <nav className={styles.header} aria-label="Main">
          <Brand />
          <div className={styles.headerLinks}>
            <a href="#games">Games</a>
            <a href="#guides">Guides</a>
          </div>
        </nav>
      </header>

      <main className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1>{site.name}</h1>
            <time dateTime={dateAttribute.format(now)}>{dateLabel.format(now)}</time>
          </div>
          <QuickGuess key={quickGuessIndex} initialIndex={quickGuessIndex} />
        </div>

        <div className={styles.jumpBar}>
          <nav aria-label="Jump to">
            <strong>Jump to</strong>
            <a href="#games">Games</a>
            <span aria-hidden="true">·</span>
            <a href="#topics">Topics</a>
            <span aria-hidden="true">·</span>
            <a href="#guides">Guides</a>
          </nav>
          <p><strong>Clue tip</strong> One detail can rule out several answers.</p>
        </div>

        <section id="games" aria-label="Games" className={styles.games}>
          <section aria-labelledby="titles-and-words">
            <h2 id="titles-and-words">Titles &amp; Words</h2>
            <ul className={styles.gameGrid} role="list">
              {games.slice(0, 3).map((game) => (
                <li key={game.path}><GameCard game={game} eager /></li>
              ))}
              <li>
                <a className={styles.random} href={playableGames[randomIndex(playableGames.length)].path}>
                  <Icon kind="shuffle" />
                  <span>Pick a random game</span>
                </a>
              </li>
            </ul>
          </section>

          <section aria-labelledby="nature-size-logic">
            <h2 id="nature-size-logic">Nature, Size &amp; Logic</h2>
            <ul className={styles.gameGrid} role="list">
              {games.slice(3).map((game) => (
                <li key={game.path}><GameCard game={game} eager={false} /></li>
              ))}
              <li>
                <form action="/#quick-guess">
                  <button className={styles.random} type="submit" name="quick" value="another">
                    <Icon kind="shuffle" />
                    <span>Try a random puzzle</span>
                  </button>
                </form>
              </li>
            </ul>
          </section>
        </section>

        <div className={styles.editorial}>
          <section aria-labelledby="featured-challenge">
            <h2 id="featured-challenge">Featured Challenge</h2>
            <ArticleCard article={featuredChallenge} photo="movie-night" wide />
          </section>
          <section aria-labelledby="topic-picks">
            <h2 id="topic-picks">Topic Picks</h2>
            <div className={styles.topicPicks}>
              {topicPicks.map((article) => (
                <ArticleCard article={article} photo={article.id} key={article.id} />
              ))}
            </div>
          </section>
        </div>

        <section id="topics" aria-labelledby="topic-heading" className={styles.topics}>
          <h2 id="topic-heading">Browse by Topic</h2>
          <ul className={styles.topicGrid} role="list">
            {browseTopics.filter(({ path }) => isPlayablePath(path)).map((topic) => {
              const art = gameArt[topic.path];

              return (
                <li key={topic.path}>
                  <a className={styles.topicLink} href={topic.path}>
                    {art && <GameBadge kind={art} soft />}
                    <span>
                      <strong>{topic.name}</strong>
                      <span className={styles.caption}>{topic.description}</span>
                    </span>
                    <span className={styles.chevron} aria-hidden="true">›</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="guides" aria-labelledby="guide-heading" className={styles.guides}>
          <h2 id="guide-heading">Guessing Guides</h2>
          <div className={styles.guideGrid}>
            <ArticleCard article={leadGuide} photo="estimate-size" wide />
            <div className={styles.guideList}>
              {otherGuides.map((article) => <ArticleCard article={article} key={article.id} />)}
            </div>
          </div>
        </section>
      </main>

      <footer className={`${styles.container} ${styles.footer}`}>
        <Brand />
        <nav aria-label="Footer">
          {legalNav.map(({ href, label }) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
