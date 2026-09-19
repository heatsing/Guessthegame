import { MAX_GUESSES } from "./constants";
import { guessMatchesAnswer, normalizeGuess } from "./guess";

export type GuessKind = "guess" | "skip";

export type GuessRecord = {
  kind: GuessKind;
  text: string;
  correct: boolean;
};

export type PlayStatus = "playing" | "won" | "lost";

export type PlayState = {
  date: string;
  guesses: GuessRecord[];
  status: PlayStatus;
};

export function createPlayState(date: string): PlayState {
  return { date, guesses: [], status: "playing" };
}

export function isFinished(status: PlayStatus): boolean {
  return status === "won" || status === "lost";
}

export function revealedScreenshotCount(
  state: PlayState,
  screenshotCount: number,
): number {
  if (screenshotCount <= 0) return 0;
  if (isFinished(state.status)) return screenshotCount;
  return Math.min(state.guesses.length + 1, screenshotCount);
}

function finishIfNeeded(state: PlayState): PlayState {
  if (state.status !== "playing") return state;
  if (state.guesses.some((guess) => guess.correct)) {
    return { ...state, status: "won" };
  }
  if (state.guesses.length >= MAX_GUESSES) {
    return { ...state, status: "lost" };
  }
  return state;
}

export function applyGuess(
  state: PlayState,
  rawGuess: string,
  accepted: readonly string[],
): PlayState {
  if (state.status !== "playing") return state;
  const text = rawGuess.trim();
  if (!text) return state;

  const needle = normalizeGuess(text);
  const duplicate = state.guesses.some(
    (guess) =>
      guess.kind === "guess" && normalizeGuess(guess.text) === needle,
  );
  if (duplicate) return state;

  const correct = guessMatchesAnswer(text, accepted);
  return finishIfNeeded({
    ...state,
    guesses: [...state.guesses, { kind: "guess", text, correct }],
  });
}

export function applySkip(state: PlayState): PlayState {
  if (state.status !== "playing") return state;
  return finishIfNeeded({
    ...state,
    guesses: [...state.guesses, { kind: "skip", text: "Skip", correct: false }],
  });
}

export function remainingGuesses(state: PlayState): number {
  return Math.max(0, MAX_GUESSES - state.guesses.length);
}
