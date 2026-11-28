"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { gradeAnswer } from "@/lib/play/grading";
import type { QuestionVersion } from "@/lib/play/types";

import styles from "./FeaturedMovie.module.css";

const puzzle: QuestionVersion = {
  questionId: "movie-night-oz", revision: 1, gameSlug: "guess-the-movie",
  prompt: "A storm carries a girl far from home. She follows a yellow road, and a scarecrow joins her journey. Which film is it?",
  answerConfig: { type: "title", answer: "The Wizard of Oz", aliases: ["Wizard of Oz"] },
  explanation: "The yellow brick road and Dorothy’s first traveling companion point to The Wizard of Oz.",
  hints: [], sources: [],
};

export function FeaturedMovie() {
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);

  function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const grade = gradeAnswer(puzzle, guess, 0);
    setDone(grade.status === "settled");
    setFeedback(grade.status === "settled" ? "Correct!" : grade.message ?? "Not quite. Try another title.");
  }
  return (
    <div>
      <p className={styles.clue} id="featured-clue">{puzzle.prompt}</p>
      {!done && (
        <form className={styles.form} onSubmit={check}>
          <label htmlFor="featured-guess">Movie title</label>
          <input
            id="featured-guess"
            aria-describedby="featured-clue"
            value={guess}
            maxLength={200}
            onChange={(event) => setGuess(event.target.value)}
          />
          <div className={styles.actions}>
            <button className={styles.check} type="submit">Check guess</button>
            <button
              className={styles.textAction}
              type="button"
              onClick={() => { setDone(true); setFeedback("Answer revealed."); }}
            >
              Reveal answer
            </button>
          </div>
        </form>
      )}
      <div className={styles.feedback} role="status">
        {feedback && <p><strong>{feedback}</strong>{done && ` ${puzzle.explanation}`}</p>}
      </div>
      {done && (
        <Link className={styles.textAction} href="/guess-the-movie" prefetch={false}>
          Play another movie clue
        </Link>
      )}
    </div>
  );
}
