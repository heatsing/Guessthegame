import Link from "next/link";

import { StatsEntry } from "@/components/stats/StatsEntry";
import { getDailyPuzzleDate } from "@/lib/daily/date";
import { site } from "@/lib/site";

export function Header() {
  const today = getDailyPuzzleDate();

  return (
    <header className="border-b border-white/10 bg-[color:var(--surface)]">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0 no-underline">
          <span className="block truncate text-sm font-semibold tracking-tight text-[color:var(--foreground)]">
            {site.name}
          </span>
          <span className="block text-xs uppercase tracking-[0.18em] text-[color:var(--accent)]">
            {site.product}
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Link
            href="/archive"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
          >
            Archive
          </Link>
          <Link
            href="/#how-to-play"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
          >
            How to play
          </Link>
          <Link
            href="/themes"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
          >
            Themes
          </Link>
          <StatsEntry today={today} />
        </nav>
      </div>
    </header>
  );
}
