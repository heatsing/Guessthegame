"use client";

import { useRef, useState } from "react";

import { quickGuessExampleCount, quickGuessExamples } from "./quick-guess-examples";
import styles from "./QuickGuess.module.css";

const choices = [
  { label: "Yes", value: true },
  { label: "No", value: false },
] as const;

export function QuickGuess({ initialIndex = 0 }: { initialIndex?: number }) {
  const [exampleIndex, setExampleIndex] = useState(() =>
    quickGuessExamples[initialIndex] ? initialIndex : 0,
  );
  const [answer, setAnswer] = useState<boolean | null>(null);
  const firstChoice = useRef<HTMLButtonElement>(null);
  const example = quickGuessExamples[exampleIndex];
  const answered = answer !== null;

  function showNextExample() {
    setExampleIndex((index) => (index + 1) % quickGuessExampleCount);
    setAnswer(null);
    firstChoice.current?.focus();
  }

  return (
    <section
      id="quick-guess"
      className={styles.panel}
      aria-labelledby="quick-guess-title"
    >
      <h2 className={styles.title} id="quick-guess-title">
        Quick Guess
      </h2>
      <p className={styles.prompt} id="quick-guess-prompt">
        {example.prompt}
      </p>
      <div
        className={styles.choices}
        role="group"
        aria-labelledby="quick-guess-prompt"
      >
        {choices.map(({ label, value }) => (
          <button
            key={label}
            ref={value ? firstChoice : undefined}
            type="button"
            aria-pressed={answer === value}
            aria-disabled={answered}
            onClick={answered ? undefined : () => setAnswer(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className={styles.feedback} role="status">
        {answered && (
          <>
            <strong>{answer === example.answer ? "Correct." : "Incorrect."}</strong>{" "}
            {example.explanation}
          </>
        )}
      </p>
      {answered && (
        <button className={styles.next} type="button" onClick={showNextExample}>
          Another puzzle
        </button>
      )}
    </section>
  );
}
