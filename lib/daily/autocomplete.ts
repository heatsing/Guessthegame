import { flattenAliases } from "@/lib/catalog/schema";
import type { GuessCatalogGame } from "@/lib/catalog/guess-index";

import { normalizeGuess } from "./guess";

export const MAX_SUGGESTIONS = 8;
export const MAX_GUESS_INPUT_LENGTH = 200;

export type AutocompleteSuggestion = {
  id: string;
  title: string;
  /** Alias that matched when it is not the canonical title. */
  matchedAlias: string | null;
};

function uniqueStrings(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = normalizeGuess(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

/**
 * Lower is better. Exact title/alias, then prefix, then substring, then
 * word-prefix. Returns -1 when there is no match.
 */
function matchScore(needle: string, haystack: string): number {
  if (haystack === needle) return 0;
  if (haystack.startsWith(needle)) return 1;
  if (haystack.includes(needle)) return 2;
  const tokens = haystack.split(" ");
  if (tokens.some((token) => token.startsWith(needle))) return 3;
  return -1;
}

export function suggestGames(
  query: string,
  games: readonly GuessCatalogGame[],
  limit = MAX_SUGGESTIONS,
): AutocompleteSuggestion[] {
  const needle = normalizeGuess(query);
  if (!needle) return [];

  const ranked: {
    suggestion: AutocompleteSuggestion;
    score: number;
  }[] = [];

  for (const game of games) {
    const candidates = uniqueStrings([
      game.title,
      ...flattenAliases(game.aliases),
    ]);
    let bestScore = Number.POSITIVE_INFINITY;
    let matchedAlias: string | null = null;

    for (const raw of candidates) {
      const haystack = normalizeGuess(raw);
      if (!haystack) continue;
      const score = matchScore(needle, haystack);
      if (score < 0) continue;
      const isTitle = haystack === normalizeGuess(game.title);
      const adjusted = isTitle ? score : score + 0.05;
      if (adjusted < bestScore) {
        bestScore = adjusted;
        matchedAlias = isTitle ? null : raw;
      }
    }

    if (bestScore < Number.POSITIVE_INFINITY) {
      ranked.push({
        score: bestScore,
        suggestion: {
          id: game.id,
          title: game.title,
          matchedAlias,
        },
      });
    }
  }

  ranked.sort(
    (a, b) => a.score - b.score || a.suggestion.title.localeCompare(b.suggestion.title),
  );

  return ranked.slice(0, Math.max(0, limit)).map((item) => item.suggestion);
}

export function nextActiveIndex(current: number, count: number): number {
  if (count <= 0) return -1;
  if (current < 0 || current >= count - 1) return 0;
  return current + 1;
}

export function prevActiveIndex(current: number, count: number): number {
  if (count <= 0) return -1;
  if (current <= 0) return count - 1;
  return current - 1;
}

/** Title to submit: highlighted suggestion, else the free-text input. */
export function resolveGuessValue(
  rawInput: string,
  suggestions: readonly AutocompleteSuggestion[],
  activeIndex: number,
  listOpen: boolean,
): string {
  if (
    listOpen &&
    activeIndex >= 0 &&
    activeIndex < suggestions.length
  ) {
    return suggestions[activeIndex]!.title;
  }
  return rawInput.trim();
}
