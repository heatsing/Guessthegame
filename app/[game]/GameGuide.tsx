import Link from "next/link";

import { blogPath, posts } from "@/lib/blog";
import type { GameGuideContent } from "@/lib/play/game-guides";
import type { playGames } from "@/lib/play/games";
import { guideLessons } from "@/lib/play/guide-lessons";
import { guidePractice } from "@/lib/play/guide-practice";
import type { PlayGame } from "@/lib/play/types";

import styles from "./game-guide.module.css";

const sharedQuestions = [
  {
    question: "Can I choose a topic or difficulty?",
    answer: "Open Question filters below the game, choose a difficulty or an available topic, and select Apply. Topic choices depend on the game.",
  },
  {
    question: "Can I resume my current clue?",
    answer: "Keep the same browser tab and filters to pick up your round after refreshing. If the round has expired, use Start over to get a fresh clue.",
  },
];

export function GameGuide({ game, guide, related }: {
  game: (typeof playGames)[number];
  guide: GameGuideContent;
  related: readonly PlayGame[];
}) {
  const lesson = guideLessons[game.slug];
  const practice = guidePractice[game.slug];
  const reading = [game, ...related]
    .flatMap(({ slug }) => posts.filter((post) => post.game === slug))
    .slice(0, 2);
  const { example } = guide;

  return (
    <article className={styles.guide} aria-labelledby="game-guide">
      <header className={styles.intro}>
        <h2 id="game-guide">{guide.heading}</h2>
        <p>{guide.introduction}</p>
      </header>

      <details className={styles.overview} open id="rules">
        <summary>How to play {game.name}</summary>
        <div className={styles.panel}>
          <section aria-labelledby="guide-steps">
            <h3 id="guide-steps">Each round, step by step</h3>
            <ol className={styles.rules}>
              {guide.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>

          <nav className={styles.jumpLinks} aria-labelledby="guide-sections">
            <h3 id="guide-sections">On this page</h3>
            <ul role="list">
              <li><a href="#tips">Strategy</a></li>
              <li><a href="#example">Worked example</a></li>
              <li><a href="#practice">Practice questions</a></li>
              <li><a href="#play">Back to the game ↑</a></li>
            </ul>
          </nav>

          <section className={styles.questions} aria-labelledby="faq">
            <h3 id="faq">Common questions</h3>
            <dl>
              {[...guide.questions, ...sharedQuestions].map(({ question, answer }) => (
                <div key={question}>
                  <dt>{question}</dt>
                  <dd>{answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.resources} aria-labelledby="guide-reading">
            <div className={styles.resourceHeading}>
              <h3 id="guide-reading">More guessing guides</h3>
              <Link href="/blog" prefetch={false}>All guides</Link>
            </div>
            <ul role="list">
              {reading.map((post) => (
                <li key={post.slug}>
                  <Link href={blogPath(post)} prefetch={false}>{post.title}</Link>
                  <p>{post.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </details>

      <div className={styles.reading}>
        <section className={styles.chapter} aria-labelledby="tips">
          <h3 id="tips">{guide.strategy.heading}</h3>
          {guide.strategy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section className={styles.chapter} aria-labelledby="method">
          <h3 id="method">{lesson.heading}</h3>
          <ol className={styles.method}>
            {lesson.steps.map(({ title, detail }) => (
              <li key={title}>
                <h4>{title}</h4>
                <p>{detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.chapter} aria-labelledby="example">
          <h3 id="example">Worked example</h3>
          <div className={styles.example}>
            <p className={styles.prompt}>{example.prompt}</p>
            {example.working && (
              <table className={styles.working} aria-label="Worked example calculation">
                <thead>
                  <tr><th scope="col">Step</th><th scope="col">Value</th></tr>
                </thead>
                <tbody>
                  {example.working.map(({ step, value }) => (
                    <tr key={step}><th scope="row">{step}</th><td>{value}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
            <p><strong>{example.answer}</strong></p>
            <p>{example.explanation}</p>
          </div>
        </section>

        <section className={styles.chapter} aria-labelledby="practice">
          <h3 id="practice">Practice questions</h3>
          <p>Make a guess, then open each answer to check your reasoning.</p>
          <div className={styles.practice}>
            {practice.map(({ prompt, answer, explanation }) => (
              <details key={prompt}>
                <summary>{prompt}</summary>
                <p><strong>{answer}</strong></p>
                <p>{explanation}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <nav className={styles.related} aria-labelledby="related">
        <h3 id="related">Related games</h3>
        <ul role="list">
          {related.map(({ slug, name }) => (
            <li key={slug}><Link href={`/${slug}`} prefetch={false}>{name}</Link></li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
