import { ArchiveList } from "@/components/archive/ArchiveList";
import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { listArchiveDates } from "@/lib/daily/archive";
import { ARCHIVE_LIMIT } from "@/lib/daily/constants";
import { getDailyPuzzleDate } from "@/lib/daily/date";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata(
  "/archive",
  "Archive",
  `Replay the last ${ARCHIVE_LIMIT} published ThemeShot daily puzzles. Guess the game from curated screenshots.`,
);

export default function ArchivePage() {
  const today = getDailyPuzzleDate();
  const dates = listArchiveDates(loadBundledCatalog(), today);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {site.product}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
        Archive
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)] sm:text-lg sm:leading-8">
        Replay the last {ARCHIVE_LIMIT} published ThemeShots. Future and
        unpublished dates are not listed.
      </p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
        Dates use the UTC calendar. Played days are marked from this browser
        only.
      </p>

      <div className="mt-8">
        <ArchiveList dates={dates} today={today} />
      </div>
    </main>
  );
}
