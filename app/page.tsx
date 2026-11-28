import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import { FeaturedMovie } from "@/components/home/FeaturedMovie";
import { QuickGuess } from "@/components/home/QuickGuess";
import { quickGuessExampleCount } from "@/components/home/quick-guess-examples";
import { posts, blogPath } from "@/lib/blog";
import { gamePresentation } from "@/lib/game-presentation";
import { playGames } from "@/lib/play/games";
import { homeDescription, homeTitle, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

import styles from "./home.module.css";

export const metadata = pageMetadata("/", homeTitle, homeDescription, { absoluteTitle: true });

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

export default async function Home({ searchParams }: PageProps<"/">) {
  await connection();
  const { quick } = await searchParams;
  const index = quick === "another" ? 1 + randomIndex(quickGuessExampleCount - 1) : 0;
  const randomGame = playGames[randomIndex(playGames.length)];
  return (
    <div className={styles.page}>
      <header className={styles.container}>
        <nav className={styles.header} aria-label="Main">
          <Brand className={styles.brand} />
          <div className={styles.headerLinks}>
            <a href="#games">Games</a>
            <Link href="/blog">Blog</Link>
          </div>
        </nav>
      </header>

      <main className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>{site.name}</h1>
            <p>Use written clues to guess movies, books, words, and plants, estimate sizes, or solve logic puzzles.</p>
            <a href="#games" className={styles.heroLink}>
              Browse games <span aria-hidden="true">↓</span>
            </a>
          </div>
          <QuickGuess initialIndex={index} key={index} />
        </div>

        <section id="games" className={styles.games} aria-labelledby="games-title">
          <div className={styles.sectionHead}>
            <h2 id="games-title">Choose a game</h2>
            <Link href={`/${randomGame.slug}`} prefetch={false} className={styles.textLink}>
              Surprise me <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <ul className={styles.gameGrid}>
            {playGames.map(({ slug, name }) => (
              <li key={slug}>
                <Link href={`/${slug}`} prefetch={false} className={styles.gameCard}>
                  <Image
                    src={gamePresentation[slug].image}
                    alt=""
                    width={480}
                    height={360}
                    unoptimized
                  />
                  <span className={styles.cardCopy}>
                    <strong>{name}</strong>
                    <span>{gamePresentation[slug].caption}</span>
                  </span>
                  <span className={styles.cardArrow} aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.reading}>
          <section className={styles.feature} aria-labelledby="featured-title" id="movie-night">
            <Image
              className={styles.featurePhoto}
              src="/home/movie-night.webp"
              alt=""
              width={864}
              height={320}
              unoptimized
            />
            <div className={styles.featureBody}>
              <h2 id="featured-title">Movie Night</h2>
              <FeaturedMovie />
            </div>
          </section>

          <section aria-labelledby="blog-title" id="guides">
            <div className={styles.sectionHead}>
              <h2 id="blog-title">From the blog</h2>
              <Link href="/blog" className={styles.textLink}>
                All guides <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <ul className={styles.guides}>
              {posts.filter((post) => post.game).map((post) => (
                <li key={post.slug}>
                  <Link href={blogPath(post)}>{post.title}</Link>
                  <p>{post.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
