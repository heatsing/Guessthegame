"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { gradeAnswer } from "@/lib/play/grading";
import type { QuestionVersion } from "@/lib/play/types";
import styles from "./QuickGuess.module.css";

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
      <p className="mb-3 leading-relaxed" id="featured-clue">{puzzle.prompt}</p>
      {!done && (
        <form onSubmit={check}>
          <label className="block text-sm font-semibold" htmlFor="featured-guess">Movie title</label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input className="min-h-11 w-full rounded border border-slate-400 bg-white px-3 sm:w-64" id="featured-guess" aria-describedby="featured-clue" value={guess} maxLength={200} onChange={(event) => setGuess(event.target.value)} />
            <button className="min-h-11 rounded bg-[#152e53] px-4 font-semibold text-white" type="submit">Check guess</button>
            <button className="min-h-11 px-2 underline" type="button" onClick={() => { setDone(true); setFeedback("Answer revealed."); }}>Reveal answer</button>
          </div>
        </form>
      )}
      <div className={styles.feedback} role="status">
        {feedback && <p><strong>{feedback}</strong>{done && ` ${puzzle.explanation}`}</p>}
      </div>
      {done && <Link className="inline-flex min-h-11 items-center underline" href="/guess-the-movie" prefetch={false}>Play another movie clue</Link>}
    </div>
  );
}
