import type { Viewport } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { guessingGames } from "@/lib/guessing-games";
import { homeDescription, homeTitle, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

import styles from "./home.module.css";

export const metadata = pageMetadata("/", homeTitle, homeDescription, {
  absoluteTitle: true,
});

export const viewport: Viewport = {
  themeColor: "#f8f9fb",
};

export default async function Home() {
  await connection();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.container} aria-label="Main">
          <Link className={styles.brand} href="/" prefetch={false}>
            {site.name}
          </Link>
        </nav>
      </header>

      <main className={styles.container}>
        <h1 className={styles.title}>Online Guessing Games</h1>
        <p className={styles.intro}>
          Read the clues, make a guess, and see how you did.
        </p>

        <ul className={styles.games} aria-label="Games" role="list">
          {guessingGames.toSorted((a, b) => a.order - b.order).map((game) => (
            <li key={game.path}>
              <a className={styles.card} href={game.path}>
                <h2>{game.name}</h2>
                <p>{game.description}</p>
                <span className={styles.play}>
                  Play <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </main>

      <footer className={`${styles.container} ${styles.footer}`}>
        {site.name}
      </footer>
    </div>
  );
}
