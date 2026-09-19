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

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Private mode, missing permission, or non-secure context.
    }
  }

  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
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
