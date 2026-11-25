import Link from "next/link";

import { posts, blogPath } from "@/lib/blog";
import type { GameGuideContent } from "@/lib/play/game-guides";
import type { PlayGame } from "@/lib/play/types";

import styles from "./game-page.module.css";

export function GameGuide({ guide, related, slug }: {
  slug: string;
  guide: GameGuideContent;
  related: readonly PlayGame[];
}) {
  const post = posts.find((entry) => entry.game === slug);
  return (
    <article className={styles.guide} aria-labelledby="game-guide">
      <header className={styles.guideIntro}>
        <h2 id="game-guide">{guide.heading}</h2>
        <p>{guide.introduction}</p>
      </header>

      <nav className={styles.guideNav} aria-label="On this page">
        <a href="#rules">How to play</a>
        <a href="#example">Example</a>
        {post && <Link href={blogPath(post)}>Strategy guide</Link>}
        <a href="#faq">FAQ</a>
        <a className={styles.returnLink} href="#play">Back to game <span aria-hidden="true">↑</span></a>
      </nav>

      <section className={styles.rules} aria-labelledby="rules">
        <h3 id="rules">How to play</h3>
        <ol>
          {guide.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className={styles.guideSection} aria-labelledby="example">
        <h3 id="example">Worked example</h3>
        <div className={styles.example}>
          <p className={styles.examplePrompt}>{guide.example.prompt}</p>
          <details className={styles.exampleAnswer}>
            <summary>See example answer</summary>
            <p><strong>{guide.example.answer}</strong></p>
            <p>{guide.example.explanation}</p>
          </details>
        </div>
      </section>

      <section className={styles.guideSection} aria-labelledby="faq">
        <h3 id="faq">Frequently asked questions</h3>
        <dl className={styles.faq}>
          {guide.questions.map(({ question, answer }) => (
            <div key={question}>
              <dt>{question}</dt>
              <dd>{answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className={styles.related} aria-labelledby="related">
        <h3 id="related">Related games</h3>
        <ul role="list">
          {related.map(({ slug, name, description }) => (
            <li key={slug}>
              <Link href={`/${slug}`} prefetch={false}>
                <strong>{name}</strong>
                <span>{description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
