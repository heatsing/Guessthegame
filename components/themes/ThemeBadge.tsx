import Link from "next/link";
import { connection } from "next/server";

import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { getDailyPuzzleDate } from "@/lib/daily/date";
import {
  getActiveTheme,
  THEME_BADGE_CLASSNAME,
  themeOneLiner,
} from "@/lib/themes";

/**
 * SSR homepage badge for the UTC-current theme week.
 * Hidden when no theme window covers today. In-flow only (does not overlay play).
 */
export async function ThemeBadge() {
  await connection();
  const today = getDailyPuzzleDate();
  const theme = getActiveTheme(loadBundledCatalog().themes, today);
  if (!theme) return null;

  const oneLiner = themeOneLiner(theme.description);

  return (
    <aside className={THEME_BADGE_CLASSNAME} aria-label="This week's theme">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[color:var(--accent)]">
        This week&apos;s theme
      </p>
      <Link
        href={`/themes/${theme.slug}`}
        className="mt-1 inline-flex min-h-11 max-w-full items-center text-base font-semibold text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]"
      >
        {theme.title}
      </Link>
      <p className="text-sm leading-6 text-[color:var(--muted)]">{oneLiner}</p>
    </aside>
  );
}
