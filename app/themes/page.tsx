import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { getDailyPuzzleDate } from "@/lib/daily/date";
import { site } from "@/lib/site";
import {
  formatThemeUtcRange,
  getActiveTheme,
  listThemesNewestFirst,
  themeOneLiner,
} from "@/lib/themes";

const description = `Curated ThemeShot weeks on ${site.name}. Each week has its own screenshot puzzles — answers stay off these pages.`;

export const metadata: Metadata = {
  title: `Theme weeks | ${site.name}`,
  description,
  robots: { index: true, follow: true },
  alternates: { canonical: "/themes" },
  openGraph: {
    title: `Theme weeks | ${site.name}`,
    description,
    url: "/themes",
  },
};

export default async function ThemesIndexPage() {
  await connection();
  const today = getDailyPuzzleDate();
  const catalog = loadBundledCatalog();
  const themes = listThemesNewestFirst(catalog.themes);
  const current = getActiveTheme(catalog.themes, today);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {site.product}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
        Theme weeks
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)]">
        One curated angle at a time. Theme pages explain the week and list
        published puzzle dates — never the answers.
      </p>

      {themes.length === 0 ? (
        <p className="mt-8 text-sm text-[color:var(--muted)]">
          No theme weeks are scheduled yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {themes.map((theme) => {
            const isCurrent = current?.id === theme.id;
            return (
              <li
                key={theme.id}
                className="rounded-xl border border-white/10 bg-[color:var(--surface)] px-4 py-4"
              >
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[color:var(--accent)]">
                  {isCurrent ? "Current theme" : "Theme week"}
                </p>
                <Link
                  href={`/themes/${theme.slug}`}
                  className="mt-1 inline-flex min-h-11 items-center text-lg font-semibold text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]"
                >
                  {theme.title}
                </Link>
                <p className="text-xs text-[color:var(--muted)]">
                  {formatThemeUtcRange(theme.start_date, theme.end_date)}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {themeOneLiner(theme.description)}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <nav
        className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm"
        aria-label="Theme week links"
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-medium text-[color:var(--accent)] no-underline hover:underline"
        >
          Play today&apos;s puzzle
        </Link>
        <Link
          href="/archive"
          className="inline-flex min-h-11 items-center font-medium text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
        >
          Archive
        </Link>
      </nav>
    </main>
  );
}
