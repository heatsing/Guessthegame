const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * UTC calendar date for the daily puzzle.
 *
 * Override with `DAILY_PUZZLE_DATE=YYYY-MM-DD` (server) for demos or tests.
 * Production should leave it unset and rely on the real UTC day plus a seeded
 * row for that date.
 */
export function getDailyPuzzleDate(
  env: Record<string, string | undefined> = process.env,
  now: Date = new Date(),
): string {
  const override = env.DAILY_PUZZLE_DATE?.trim();
  if (override) {
    if (!ISO_DATE.test(override)) {
      throw new Error(
        `DAILY_PUZZLE_DATE must be YYYY-MM-DD (got "${override}")`,
      );
    }
    return override;
  }
  return now.toISOString().slice(0, 10);
}

export function isIsoDate(value: string): boolean {
  return ISO_DATE.test(value);
}

export function formatPuzzleDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const utc = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(utc);
}
