"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { canAdvanceAfter, canRevealAndContinue, currentResult, sizeRule } from "@/lib/play/result";
import { PASS_ACCURACY, type PlayResult, type PlayRetry, type PublicRound } from "@/lib/play/types";

import styles from "./GamePlayer.module.css";
import { newRoundState, readRoundSession, saveRoundSession, type RoundState } from "./session";

type Action = "check" | "hint" | "reveal" | "next";
type Guess = string | boolean;
type Pending = { action: Action; guess?: Guess };
type ResumeResponse = { round: PublicRound; hints: string[]; hasMore?: boolean; result?: PlayResult };
type CheckResponse =
  | PlayRetry
  | { status: "settled"; result: PlayResult };
type HintResponse = { hint?: string; hintCount: number; hasMore?: boolean; result?: PlayResult };
type Focus = "question" | "input" | "result" | "hint";

class PlayRequestError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message);
  }
}

async function request<T>(gameSlug: string, action: string, body: object): Promise<T> {
  const response = await fetch(`/api/play/${gameSlug}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) {
    throw new PlayRequestError(payload?.message || "Please try again in a moment.", payload?.code);
  }
  return payload;
}

const resultTitles: Record<PlayResult["outcome"], string> = {
  correct: "Correct!",
  assisted: "Correct with a hint!",
  revealed: "Answer revealed",
  skipped: "Question skipped",
  within: "Level passed",
  low: "Below range",
  high: "Above range",
  incorrect: "Not quite",
};

const measurement = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 8 });

function Accuracy({ value, retry = false, feedback }: { value: number; retry?: boolean; feedback?: string }) {
  const rounded = Math.round(value * 100) / 100;
  const label = rounded === PASS_ACCURACY && rounded !== value
    ? `${value > rounded ? ">" : "<"}${rounded}`
    : String(rounded);
  return (
    <div className={styles.accuracy} data-passed={value > PASS_ACCURACY}>
      {feedback && <p><strong>{feedback}</strong></p>}
      <p><strong>{label}%</strong> accuracy</p>
      <meter min={0} max={100} value={value} aria-label="Answer accuracy" />
      {retry && <p>Score more than {PASS_ACCURACY}% to unlock the next question. Try again.</p>}
    </div>
  );
}

function displayAnswer(value: PlayResult["answer"], unit?: string) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return unit ? `${measurement.format(value)} ${unit}` : measurement.format(value);
  return value;
}

export function GamePlayer({
  gameSlug,
  initialRound,
  selection,
}: {
  gameSlug: string;
  initialRound: PublicRound | null;
  selection?: { topic?: string; difficulty?: string };
}) {
  const { topic, difficulty } = selection ?? {};
  const gameKey = `guess-the-game:play:v1:${gameSlug}`;
  const storageKey = topic || difficulty
    ? `${gameKey}:${JSON.stringify([topic ?? "", difficulty ?? ""])}`
    : gameKey;
  const [state, setState] = useState(() => newRoundState(initialRound));
  const [pending, setPending] = useState<Pending | null>(null);
  const [notice, setNotice] = useState("");
  const current = useRef(state);
  const sessionId = useRef("");
  const busy = useRef(false);
  const epoch = useRef(0);
  const questionHeading = useRef<HTMLHeadingElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const inputElement = useRef<HTMLInputElement>(null);
  const firstChoice = useRef<HTMLButtonElement>(null);
  const lastHint = useRef<HTMLLIElement>(null);
  const focus = useRef<Focus | null>(null);
  const preload = useRef<{
    source: string;
    promise: Promise<PublicRound | null>;
    round: PublicRound | null;
  } | null>(null);

  const save = useCallback((next: RoundState) => {
    current.current = next;
    setState(next);
    if (sessionId.current && next.round) saveRoundSession(storageKey, sessionId.current, next);
  }, [storageKey]);

  const resume = useCallback(async (round: PublicRound, isCurrent: () => boolean = () => true) => {
    const startedAt = epoch.current;
    const stillCurrent = () => isCurrent() &&
      current.current.round?.id === round.id && epoch.current === startedAt;

    try {
      const resumed = await request<ResumeResponse>(gameSlug, "resume", {
        roundId: round.id,
        sessionId: sessionId.current,
      });
      if (stillCurrent()) {
        save({
          ...current.current,
          round: resumed.round,
          hints: resumed.hints,
          hintsExhausted: resumed.hasMore === undefined
            ? current.current.hintsExhausted
            : !resumed.hasMore,
          result: resumed.result ?? null,
          expired: false,
        });
      }
    } catch (error) {
      if (stillCurrent() && error instanceof PlayRequestError && error.code === "expired") {
        save({ ...current.current, expired: true });
      }
    }
  }, [gameSlug, save]);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => {
      if (!mounted) return;
      const saved = readRoundSession(storageKey);
      sessionId.current = saved?.id ?? crypto.randomUUID();
      const initial = saved?.state ?? current.current;
      const restored = initial.result
        ? { ...initial, result: currentResult(initial.result, gameSlug) }
        : initial;
      const draft = inputElement.current?.value ?? initial.input;
      save(!saved && draft !== initial.input ? { ...restored, input: draft } : restored);
      if (initial.round) void resume(initial.round, () => mounted);
    });
    return () => { mounted = false; };
  }, [gameSlug, initialRound, resume, save, storageKey]);

  useLayoutEffect(() => {
    const target = focus.current;
    if (!target) return;
    const element = {
      question: questionHeading.current,
      input: inputElement.current ?? firstChoice.current,
      result: resultHeading.current,
      hint: lastHint.current,
    }[target];
    element?.focus();
    focus.current = null;
  }, [state, notice, pending]);

  const requestNext = useCallback((snapshot: RoundState, prefetch: boolean) =>
    request<{ round: PublicRound }>(gameSlug, "next", {
      roundId: snapshot.round?.id,
      recentQuestionIds: snapshot.recentQuestionIds,
      sessionId: sessionId.current,
      prefetch,
      ...(topic ? { topic } : {}),
      ...(difficulty ? { difficulty } : {}),
    }).then(({ round }) => round), [difficulty, gameSlug, topic]);

  useEffect(() => {
    if (!state.round || !canAdvanceAfter(state.result) ||
      state.expired || preload.current?.source === state.round.id) return;
    const source = state.round.id;
    const promise = requestNext(state, true).then(
      (round) => {
        if (preload.current?.source === source) preload.current.round = round;
        return round;
      },
      () => null,
    );
    preload.current = { source, promise, round: null };
  }, [state, requestNext]);

  async function act(action: Action, guess?: Guess) {
    const snapshot = current.current;
    const round = snapshot.round;
    if (busy.current || !sessionId.current) return;
    if (action !== "next" && (!round || snapshot.result || snapshot.expired)) return;
    if (action === "next" && (!round || snapshot.expired || !canAdvanceAfter(snapshot.result))) return;
    if (action === "hint" && snapshot.hintsExhausted) return;

    busy.current = true;
    const operation = ++epoch.current;
    const latest = () => epoch.current === operation && current.current.round?.id === round?.id;
    setNotice("");
    setPending({ action, guess });

    try {
      if (action === "next") {
        const cached = preload.current?.source === round?.id ? preload.current : null;
        const next = cached?.round ?? await cached?.promise ?? await requestNext(snapshot, false);
        if (!latest()) return;
        preload.current = null;
        focus.current = "question";
        save(newRoundState(next, snapshot.recentQuestionIds, snapshot.questionNumber + 1));
        if (cached) void resume(next);
        return;
      }
      if (!round) return;

      const identity = { roundId: round.id, revision: round.revision, sessionId: sessionId.current };
      if (action === "hint") {
        const response = await request<HintResponse>(gameSlug, "hint", {
          ...identity,
          hintCount: snapshot.hints.length,
        });
        if (!latest()) return;
        if (response.result) {
          focus.current = "result";
          save({ ...current.current, result: response.result });
          return;
        }
        const hints = response.hint && response.hintCount > snapshot.hints.length
          ? [...snapshot.hints, response.hint]
          : snapshot.hints;
        if (hints.length === snapshot.hints.length) {
          focus.current = "input";
          setNotice("No more hints for this question.");
        } else {
          focus.current = "hint";
        }
        save({ ...current.current, hints, hintsExhausted: response.hasMore === false || !response.hint });
        return;
      }

      const response = await request<CheckResponse>(gameSlug, action,
        action === "check" ? { ...identity, guess } : identity,
      );
      if (!latest()) return;
      if (response.status === "retry") {
        focus.current = "input";
        save({ ...current.current, lastAccuracy: response.accuracy, lastAccuracyMessage: response.message });
        return;
      }
      focus.current = "result";
      save({ ...current.current, result: response.result, lastAccuracy: null });
    } catch (error) {
      if (!latest()) return;
      if (error instanceof PlayRequestError && error.code === "expired") {
        save({ ...current.current, expired: true });
      } else {
        if (action === "check" && round?.answerType !== "boolean") focus.current = "input";
        setNotice(error instanceof PlayRequestError
          ? error.message
          : "We couldn’t reach the server. Try again when you’re connected.");
      }
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void act("check", current.current.input);
  }

  const { round, result, expired } = state;
  const waiting = pending !== null;
  const canAdvance = !expired && canAdvanceAfter(result);
  const isBook = gameSlug === "guess-the-book";
  const nextLabel = isBook ? "Next book" : round?.answerType === "boolean" ? "Next puzzle" : "Next Question";

  function startOver() {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // The page can still reload when browser storage is unavailable.
    }
    window.location.reload();
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
        <div className={styles.result}>
          <h3 ref={resultHeading} tabIndex={-1}>
            {result.accuracy !== undefined && result.accuracy <= PASS_ACCURACY ? "Not quite"
              : result.accuracy !== undefined && result.accuracy < 100 ? "Level passed"
                : resultTitles[result.outcome]}
          </h3>
          {result.accuracy !== undefined && <Accuracy value={result.accuracy} />}
          <dl className={styles.values}>
            {result.guess !== undefined && (
              <div><dt>Your guess</dt><dd>{displayAnswer(result.guess, result.unit)}</dd></div>
            )}
            <div>
              <dt>{result.unit ? "Reference" : "Answer"}</dt>
              <dd>{displayAnswer(result.answer, result.unit)}</dd>
            </div>
          </dl>
          <p className={styles.explanation}>{result.explanation}</p>
          {round?.answerType === "number" && <p className={styles.explanation}>{sizeRule}</p>}
          {result.sources.length > 0 && (
            <ul className={styles.sources} aria-label="Sources">
              {result.sources.filter(({ url }) => /^https?:\/\//i.test(url)).map(({ label, url }) => (
                <li key={url}><a href={url}>{label}</a></li>
              ))}
            </ul>
          )}
        </div>
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
                    onChange={(event) => save({ ...current.current, input: event.target.value })}
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
