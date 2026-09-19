import type { Catalog, Theme } from "@/lib/catalog/schema";

/** Playable days that may appear on a public theme page (never `pulled`). */
const LISTABLE_PUZZLE_STATUSES = new Set(["published", "scheduled"]);

/** In-flow homepage badge — never overlay the daily play UI. */
export const THEME_BADGE_CLASSNAME =
  "mt-6 rounded-xl border border-[color:var(--accent)]/35 bg-[color:var(--surface)] px-4 py-3 sm:px-5";

export type ThemePageCopy = {
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  rangeLabel: string;
  heroImage: string;
  publishedDates: string[];
  isCurrent: boolean;
};

export function isThemeActive(theme: Theme, utcDate: string): boolean {
  return utcDate >= theme.start_date && utcDate <= theme.end_date;
}

/**
 * The theme whose UTC window contains `utcDate`.
 * Overlapping windows are rejected by catalog validation; if they slip
 * through, the latest `start_date` wins (then slug).
 */
export function getActiveTheme(
  themes: readonly Theme[],
  utcDate: string,
): Theme | null {
  const active = themes.filter((theme) => isThemeActive(theme, utcDate));
  if (active.length === 0) return null;
  active.sort((a, b) => {
    if (a.start_date !== b.start_date) {
      return a.start_date < b.start_date ? 1 : -1;
    }
    return a.slug.localeCompare(b.slug);
  });
  return active[0] ?? null;
}

export function getThemeBySlug(
  themes: readonly Theme[],
  slug: string,
): Theme | null {
  return themes.find((theme) => theme.slug === slug) ?? null;
}

export function listThemesNewestFirst(themes: readonly Theme[]): Theme[] {
  return [...themes].sort((a, b) => {
    if (a.start_date !== b.start_date) {
      return a.start_date < b.start_date ? 1 : -1;
    }
    return a.slug.localeCompare(b.slug);
  });
}

/** First sentence for the homepage one-liner; falls back to the full blurb. */
export function themeOneLiner(description: string): string {
  const trimmed = description.trim();
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return match?.[0] ?? trimmed;
}

export function formatThemeUtcRange(startDate: string, endDate: string): string {
  return `${formatThemeUtcDay(startDate)} – ${formatThemeUtcDay(endDate)} (UTC)`;
}

function formatThemeUtcDay(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const utc = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(utc);
}

/**
 * Published puzzle dates for a theme, as of a UTC calendar day.
 * Future schedule rows stay hidden so the page cannot leak upcoming days.
 */
export function listPublishedPuzzleDates(
  catalog: Catalog,
  themeId: string,
  utcDate: string,
): string[] {
  return catalog.daily_puzzles
    .filter(
      (puzzle) =>
        puzzle.theme_id === themeId &&
        LISTABLE_PUZZLE_STATUSES.has(puzzle.status) &&
        puzzle.puzzle_date <= utcDate,
    )
    .map((puzzle) => puzzle.puzzle_date)
    .sort();
}

export function getThemePageCopy(
  catalog: Catalog,
  slug: string,
  utcDate: string,
): ThemePageCopy | null {
  const theme = getThemeBySlug(catalog.themes, slug);
  if (!theme) return null;
  return {
    slug: theme.slug,
    title: theme.title,
    description: theme.description,
    startDate: theme.start_date,
    endDate: theme.end_date,
    rangeLabel: formatThemeUtcRange(theme.start_date, theme.end_date),
    heroImage: theme.hero_image,
    publishedDates: listPublishedPuzzleDates(catalog, theme.id, utcDate),
    isCurrent: isThemeActive(theme, utcDate),
  };
}

/** Guard for tests: theme pages must never mention an answer title. */
export function themeCopyContainsAnswer(
  copy: ThemePageCopy,
  accepted: readonly string[],
): boolean {
  const blob = JSON.stringify(copy).toLowerCase();
  return accepted.some((alias) => {
    const needle = alias.trim().toLowerCase();
    return needle.length > 0 && blob.includes(needle);
  });
}
