import { MAX_GUESSES } from "./constants";
import type { GuessRecord, PlayState } from "./play";

/** Wordle-style marks: hit, miss, skip. Never encode the typed title. */
export const SHARE_EMOJI = {
  hit: "🟩",
  miss: "🟥",
  skip: "⬛",
} as const;

export const SHARE_SITE_NAME = "GuessTheGame.net";
export const SHARE_URL = "https://guessthegame.net";

export function emojiForGuess(guess: GuessRecord): string {
  if (guess.correct) return SHARE_EMOJI.hit;
  if (guess.kind === "skip") return SHARE_EMOJI.skip;
  return SHARE_EMOJI.miss;
}

export function shareScore(status: PlayState["status"], guessCount: number): string {
  if (status === "won") return `${guessCount}/${MAX_GUESSES}`;
  return `X/${MAX_GUESSES}`;
}

export function buildShareGrid(guesses: readonly GuessRecord[]): string {
  return guesses.map(emojiForGuess).join("");
}

/**
 * Spoiler-free result text for clipboard / Web Share.
 * Includes site name, puzzle date, emoji grid, score, and the public URL.
 * Must never include the game title or typed guesses.
 */
export function buildShareText(
  state: Pick<PlayState, "date" | "status" | "guesses">,
): string {
  const score = shareScore(state.status, state.guesses.length);
  const grid = buildShareGrid(state.guesses);

  return [
    `${SHARE_SITE_NAME} — ${state.date}`,
    grid,
    score,
    SHARE_URL,
  ].join("\n");
}

function copyNodeContents(node: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection) return false;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  selection.removeAllRanges();
  return ok;
}

function copyWithExecCommand(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "2em";
  textarea.style.height = "2em";
  textarea.style.padding = "0";
  textarea.style.border = "none";
  textarea.style.outline = "none";
  textarea.style.boxShadow = "none";
  textarea.style.background = "transparent";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

const CLIPBOARD_TIMEOUT_MS = 1000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("clipboard-timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Copy in the same user-gesture tick first (`execCommand`), then Clipboard API.
 * Awaiting the Clipboard API before the fallback can drop the gesture on iOS
 * and in permission-gated automation browsers. Clipboard writes are timed out
 * so the UI never hangs waiting for a permission prompt.
 */
export async function copyTextToClipboard(
  text: string,
  sourceNode?: HTMLElement | null,
): Promise<boolean> {
  if (sourceNode && copyNodeContents(sourceNode)) return true;
  if (copyWithExecCommand(text)) return true;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await withTimeout(navigator.clipboard.writeText(text), CLIPBOARD_TIMEOUT_MS);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function canUseWebShare(text: string): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (typeof navigator.canShare === "function") {
    try {
      return navigator.canShare({ text });
    } catch {
      return false;
    }
  }
  return true;
}
