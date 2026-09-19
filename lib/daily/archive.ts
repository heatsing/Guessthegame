import type { Catalog } from "@/lib/catalog/schema";

import { ARCHIVE_LIMIT } from "./constants";
import { getDailyPuzzleDate, isValidUtcIsoDate } from "./date";
import { getPlayableDaily, type PlayableDaily } from "./load-puzzle";

/**
 * A UTC date is open for replay when it is a real calendar day and not in
 * the future relative to `today` (the daily UTC key, including
 * `DAILY_PUZZLE_DATE` overrides).
 */
export function isPuzzleDateOpen(date: string, today: string): boolean {
  return isValidUtcIsoDate(date) && date <= today;
}

/**
 * Playable catalog row that is already open for that UTC day.
 * Future rows, invalid dates, pulled/unpublished days, and empty media
 * all resolve to `null` (404 on `/puzzle/[date]`).
 */
export function resolveReplayPuzzle(
  catalog: Catalog,
  date: string,
  today: string = getDailyPuzzleDate(),
): PlayableDaily | null {
  if (!isPuzzleDateOpen(date, today)) return null;
  return getPlayableDaily(catalog, date);
}

/**
 * Newest-first UTC dates for the archive hub. `candidateDates` may include
 * duplicates, future keys, or unplayable days — those are dropped.
 */
export function selectArchiveDates(
  candidateDates: readonly string[],
  today: string,
  isPlayable: (date: string) => boolean,
  limit: number = ARCHIVE_LIMIT,
): string[] {
  const seen = new Set<string>();
  const open: string[] = [];
  for (const date of candidateDates) {
    if (seen.has(date)) continue;
    seen.add(date);
    if (!isPuzzleDateOpen(date, today)) continue;
    if (!isPlayable(date)) continue;
    open.push(date);
  }
  open.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  return open.slice(0, Math.max(0, limit));
}

export function listArchiveDates(
  catalog: Catalog,
  today: string = getDailyPuzzleDate(),
  limit: number = ARCHIVE_LIMIT,
): string[] {
  return selectArchiveDates(
    catalog.daily_puzzles.map((puzzle) => puzzle.puzzle_date),
    today,
    (date) => getPlayableDaily(catalog, date) !== null,
    limit,
  );
}

/** Finished runs from localStorage (`playedDates`) that appear on the hub. */
export function playedArchiveDates(
  archiveDates: readonly string[],
  playedDates: readonly string[],
): string[] {
  const played = new Set(playedDates);
  return archiveDates.filter((date) => played.has(date));
}
