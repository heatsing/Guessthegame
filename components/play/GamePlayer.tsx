"use client";

import type { FormEvent } from "react";

import { canRevealAndContinue } from "@/lib/play/result";

import styles from "./GamePlayer.module.css";
import { Accuracy, RoundFeedback } from "./RoundFeedback";
import { useGameRound, type GameRoundOptions } from "./useGameRound";

export function GamePlayer(options: GameRoundOptions) {
  const { gameSlug } = options;
  const { state, pending, notice, canAdvance, act, updateInput, startOver, refs } = useGameRound(options);
  const { questionHeading, resultHeading, inputElement, firstChoice, lastHint } = refs;
  const { round, result, expired } = state;
  const waiting = pending !== null;
  const nextLabel = gameSlug === "guess-the-book" ? "Next book" : round?.answerType === "boolean" ? "Next puzzle" : "Next Question";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void act("check");
  }

  return (
    <section className={styles.board} aria-labelledby="question-prompt">
      <span className={styles.label}>{round ? `Question ${state.questionNumber}` : "Play"}</span>
      <h2 className={styles.prompt} id="question-prompt" ref={questionHeading} tabIndex={-1}>
        {round?.prompt ?? "No question is available right now."}
      </h2>

      {state.hints.length > 0 && (
        <ol className={styles.hints} aria-label="Hints" aria-live="polite">
          {state.hints.map((hint, index) => (
            <li key={index} tabIndex={-1} ref={index === state.hints.length - 1 ? lastHint : undefined}>
              <strong>Hint {index + 1}</strong>{hint}
            </li>
          ))}
        </ol>
      )}

      <div className={styles.notice} role="status">{notice}</div>

      {expired ? (
        <p className={styles.explanation}>This round has expired. Start over to keep playing.</p>
      ) : result ? (
        <RoundFeedback result={result} prompt={round?.prompt ?? ""} headingRef={resultHeading} />
      ) : round && (
        <>
          <div className={styles.attempt} role="status">
            {state.lastAccuracy !== null && (
              <Accuracy value={state.lastAccuracy} retry feedback={state.lastAccuracyMessage} />
            )}
          </div>
          {round.answerType === "boolean" ? (
            <div className={styles.choices} aria-label="Your answer" role="group">
              {[true, false].map((choice) => (
                <button
                  className={styles.secondary}
                  type="button"
                  key={String(choice)}
                  ref={choice ? firstChoice : undefined}
                  disabled={waiting}
                  onClick={() => void act("check", choice)}
                >
                  {pending?.action === "check" && pending.guess === choice
                    ? "Checking…"
                    : choice ? "Yes" : "No"}
                </button>
              ))}
            </div>
          ) : (
            <form className={styles.form} onSubmit={submit} noValidate>
              <label htmlFor="game-guess">{round.answerType === "number" ? "Your estimate" : "Your answer"}</label>
              <div className={styles.inputRow}>
                <div className={styles.inputWrap}>
                  <input
                    id="game-guess"
                    ref={inputElement}
                    value={state.input}
                    onChange={(event) => updateInput(event.target.value)}
                    type="text"
                    inputMode={round.answerType === "number" ? "decimal" : undefined}
                    aria-describedby={round.unit ? "guess-unit" : undefined}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={200}
                    readOnly={waiting}
                    required
                    placeholder={round.answerType === "number" ? "Enter a number" : "Type your guess"}
                  />
                  {round.unit && <span id="guess-unit">{round.unit}</span>}
                </div>
                <button className={styles.primary} type="submit" disabled={waiting}>
                  {pending?.action === "check" ? "Checking…" : "Submit guess"}
                </button>
              </div>
            </form>
          )}

          <div className={styles.actions}>
            {!state.hintsExhausted && (
              <button className={styles.textButton} type="button" disabled={waiting} onClick={() => void act("hint")}>
                {pending?.action === "hint" ? "Loading hint…" : "Show hint"}
              </button>
            )}
            {round.answerType === "title" && (
              <button className={styles.textButton} type="button" disabled={waiting} onClick={() => void act("reveal")}>
                {pending?.action === "reveal" ? "Revealing…" : canRevealAndContinue(gameSlug) ? "Reveal answer" : "Show answer and end run"}
              </button>
            )}
          </div>
        </>
      )}

      {canAdvance && (
        <button className={styles.primary} type="button" onClick={() => void act("next")} disabled={waiting}>
          {pending?.action === "next" ? "Loading question…" : nextLabel}
        </button>
      )}
      {(!round || expired || (result && !canAdvance && (result.accuracy !== undefined || result.outcome === "revealed"))) && (
        <button className={styles.primary} type="button" onClick={startOver} disabled={waiting}>
          {round ? "Start over" : "Try again"}
        </button>
      )}

      <noscript><p className={styles.explanation}>Enable JavaScript to submit answers and continue playing.</p></noscript>
    </section>
  );
}
