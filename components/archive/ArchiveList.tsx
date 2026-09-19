"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { playedArchiveDates } from "@/lib/daily/archive";
import { formatPuzzleDate } from "@/lib/daily/date";
import { readDailyStats } from "@/lib/daily/storage";

type ArchiveListProps = {
  dates: string[];
  today: string;
};

function subscribePlayed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function ArchiveList({ dates, today }: ArchiveListProps) {
  const played = JSON.parse(
    useSyncExternalStore(
      subscribePlayed,
      () => JSON.stringify(playedArchiveDates(dates, readDailyStats().playedDates)),
      () => "[]",
    ),
  ) as string[];

  if (dates.length === 0) {
    return (
      <p
        className="rounded-xl border border-dashed border-white/15 bg-[color:var(--surface)] px-4 py-8 text-center text-sm leading-6 text-[color:var(--muted)]"
        role="status"
      >
        No published ThemeShots to replay yet. Check back after the next catalog
        update.
      </p>
    );
  }

  const playedSet = new Set(played);

  return (
    <ul className="flex flex-col gap-2" aria-label="Published puzzle dates">
      {dates.map((date) => {
        const isToday = date === today;
        const hasPlayed = playedSet.has(date);
        return (
          <li key={date}>
            <Link
              href={`/puzzle/${date}`}
              className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 bg-[color:var(--surface)] px-4 py-3 no-underline hover:border-white/25"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-[color:var(--foreground)]">
                  {formatPuzzleDate(date)}
                </span>
                <span className="mt-0.5 block font-mono text-xs text-[color:var(--muted)]">
                  {date} UTC
                  {isToday ? " · Today" : ""}
                </span>
              </span>
              <span
                className={`shrink-0 text-sm font-medium ${
                  hasPlayed
                    ? "text-[color:var(--accent)]"
                    : "text-[color:var(--muted)]"
                }`}
              >
                {hasPlayed ? "Played" : "Play"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
