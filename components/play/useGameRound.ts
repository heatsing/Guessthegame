import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { canAdvanceAfter, currentResult } from "@/lib/play/result";
import type { PlayResult, PlayRetry, PublicRound } from "@/lib/play/types";

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

export type GameRoundOptions = {
  gameSlug: string;
  initialRound: PublicRound | null;
  selection?: { topic?: string; difficulty?: string };
};

export function useGameRound({ gameSlug, initialRound, selection }: GameRoundOptions) {
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
        action === "check" ? { ...identity, guess: guess ?? snapshot.input } : identity,
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

  function updateInput(input: string) {
    save({ ...current.current, input });
  }

  function startOver() {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // The page can still reload when browser storage is unavailable.
    }
    window.location.reload();
  }

  return {
    state, pending, notice,
    canAdvance: !state.expired && canAdvanceAfter(state.result),
    act, updateInput, startOver,
    refs: { questionHeading, resultHeading, inputElement, firstChoice, lastHint },
  };
}
