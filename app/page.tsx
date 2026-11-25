import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";
import { FeaturedMovie } from "@/components/home/FeaturedMovie";
import { QuickGuess } from "@/components/home/QuickGuess";
import { quickGuessExampleCount } from "@/components/home/quick-guess-examples";
import { posts, blogPath } from "@/lib/blog";
import { playGames } from "@/lib/play/games";
import { homeDescription, homeTitle, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import styles from "./home.module.css";

export const metadata = pageMetadata("/", homeTitle, homeDescription, { absoluteTitle: true });

const cards = {
  "guess-the-movie": { photo: "movie", caption: "Name the film from a plot clue." },
  "guess-the-book": { photo: "book", caption: "Find the title hidden in a story." },
  "guess-the-size": { photo: "size", caption: "Estimate an everyday measurement." },
  "yes-or-no": { photo: "logic", caption: "Decide what follows from the clues." },
} satisfies Record<(typeof playGames)[number]["slug"], { photo: string; caption: string }>;

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
          <div className={styles.headerLinks}><a href="#games">Games</a><Link href="/blog">Blog</Link></div>
        </nav>
      </header>
      <main className={styles.container}>
        <div className={styles.hero}>
          <div>
            <h1>{site.name}</h1>
            <p>Guess movies and books, estimate sizes, and solve logic puzzles from written clues.</p>
          </div>
          <QuickGuess initialIndex={index} key={index} />
        </div>
        <section id="games" className={styles.section} aria-labelledby="games-title">
          <div className={styles.sectionHead}>
            <h2 id="games-title">Choose a game</h2>
            <Link href={`/${randomGame.slug}`} prefetch={false}>Surprise me</Link>
          </div>
          <ul className={styles.gameGrid}>
            {playGames.map(({ slug, name }) => (
              <li key={slug}>
                <Link href={`/${slug}`} prefetch={false} className={styles.gameCard}>
                  <Image src={`/home/${cards[slug].photo}.webp`} alt="" width={480} height={360} unoptimized />
                  <strong>{name}</strong><span>{cards[slug].caption}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.section} aria-labelledby="featured-title" id="movie-night">
          <h2 id="featured-title">Movie Night</h2>
          <FeaturedMovie />
        </section>
        <section className={styles.section} aria-labelledby="blog-title" id="guides">
          <div className={styles.sectionHead}><h2 id="blog-title">From the blog</h2><Link href="/blog">All guides</Link></div>
          <ul className={styles.guides}>
            {posts.filter((post) => post.game).map((post) => (
              <li key={post.slug}><Link href={blogPath(post)}>{post.title}</Link><p>{post.summary}</p></li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
