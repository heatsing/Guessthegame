import { PASS_ACCURACY, type PlayResult } from "./types";

export const SIZE_ERROR_LIMIT = 100 - PASS_ACCURACY;
export const sizeRule = `An estimate passes when its error is less than ${SIZE_ERROR_LIMIT}% of the reference value.`;

export function canAdvanceAfter(result: PlayResult | null): boolean {
  return result?.outcome === "skipped" ||
    (result?.outcome === "incorrect" && typeof result.guess === "boolean") ||
    (result?.accuracy ?? 0) > PASS_ACCURACY;
}

export function currentResult(result: PlayResult, gameSlug: string): PlayResult {
  if (gameSlug === "guess-the-book" && result.outcome === "revealed") {
    return { ...result, outcome: "skipped" };
  }
  if (typeof result.answer !== "number") return result;

  // Earlier revisions included a fixed acceptance interval after the derivation.
  const explanation = result.explanation.replace(
    /\s+This question accepts \d+(?:\.\d+)?[–-]\d+(?:\.\d+)? [\p{L}]+\.\s*$/u,
    "",
  );
  const refreshed = { ...result, explanation };
  delete refreshed.min;
  delete refreshed.max;
  return refreshed;
}
