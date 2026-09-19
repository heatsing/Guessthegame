import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DailyPlay } from "@/components/daily/DailyPlay";
import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { resolveReplayPuzzle } from "@/lib/daily/archive";
import { formatPuzzleDate, getDailyPuzzleDate } from "@/lib/daily/date";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type PuzzlePageProps = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({
  params,
}: PuzzlePageProps): Promise<Metadata> {
  const { date } = await params;
  const puzzle = resolveReplayPuzzle(loadBundledCatalog(), date);
  if (!puzzle) notFound();

  return pageMetadata(
    `/puzzle/${date}`,
    `ThemeShot ${date}`,
    `Replay the ${date} ThemeShot daily puzzle. Guess the game from curated screenshots.`,
    { index: false },
  );
}

export default async function PuzzlePage({ params }: PuzzlePageProps) {
  const { date } = await params;
  const catalog = loadBundledCatalog();
  const puzzle = resolveReplayPuzzle(catalog, date);
  if (!puzzle) notFound();

  const today = getDailyPuzzleDate();
  const isToday = date === today;
  const heading = isToday
    ? "Guess today's game"
    : `Guess the ${formatPuzzleDate(date)} game`;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {site.product}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
        {heading}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)]">
        Same rules as the daily ThemeShot: six screenshots, six guesses, Skip.
        This page is not indexed.
      </p>
      <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
        >
          Today&apos;s puzzle
        </Link>
        <Link
          href="/archive"
          className="inline-flex min-h-11 items-center font-medium text-[color:var(--muted)] underline-offset-4 hover:underline hover:text-[color:var(--foreground)]"
        >
          Archive
        </Link>
      </nav>

      <noscript>
        <p className="mt-6 rounded-xl border border-white/10 bg-[color:var(--surface)] px-4 py-5 text-sm leading-6 text-[color:var(--muted)]">
          JavaScript is required to play this ThemeShot. This page does not
          include the answer.
        </p>
      </noscript>

      <div className="mt-8">
        <DailyPlay date={date} />
      </div>
    </main>
  );
}
