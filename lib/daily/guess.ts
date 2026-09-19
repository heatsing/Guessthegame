import { flattenAliases, type Game } from "@/lib/catalog/schema";

/** Normalize a player guess or catalog alias for case-insensitive matching. */
export function normalizeGuess(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[:：.'’"“”!?！？,，]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function acceptedAnswersForGame(game: Game): string[] {
  return [game.title, ...flattenAliases(game.aliases)];
}

export function guessMatchesAnswer(
  rawGuess: string,
  accepted: readonly string[],
): boolean {
  const needle = normalizeGuess(rawGuess);
  if (!needle) return false;
  return accepted.some((alias) => normalizeGuess(alias) === needle);
}
