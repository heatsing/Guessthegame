"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { MAX_GUESSES } from "@/lib/daily/constants";
import {
  emptyStats,
  playedCount,
  winRatePercent,
  type DailyStats,
} from "@/lib/daily/stats";
import { readDailyRun, readDailyStats } from "@/lib/daily/storage";

const OPEN_STATS_EVENT = "themeshot:open-stats";

export function openStatsPanel(): void {
  window.dispatchEvent(new Event(OPEN_STATS_EVENT));
}

type StatsEntryProps = {
  today: string;
};

export function StatsEntry({ today }: StatsEntryProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<DailyStats>(emptyStats);
  const [todayGuesses, setTodayGuesses] = useState<number | null>(null);

  const refresh = useCallback(() => {
    setStats(readDailyStats(today));
    const run = readDailyRun(today);
    setTodayGuesses(run?.status === "won" ? run.guesses.length : null);
  }, [today]);

  function close() {
    setOpen(false);
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
  }

  useEffect(() => {
    function handleOpen() {
      refresh();
      setOpen(true);
    }

    function handleHash() {
      if (window.location.hash === "#stats") handleOpen();
    }

    window.addEventListener(OPEN_STATS_EVENT, handleOpen);
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => {
      window.removeEventListener(OPEN_STATS_EVENT, handleOpen);
      window.removeEventListener("hashchange", handleHash);
    };
  }, [refresh]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      closeRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const played = playedCount(stats);
  const maxBar = Math.max(1, ...stats.guessDistribution);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          refresh();
          setOpen(true);
        }}
        className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Stats
      </button>
      <dialog
        ref={dialogRef}
        id="stats"
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md max-h-[min(90vh,40rem)] overflow-y-auto rounded-xl border border-white/10 bg-[color:var(--surface)] p-0 text-[color:var(--foreground)] shadow-2xl backdrop:bg-black/65"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)]">
                This browser
              </p>
              <h2
                id={titleId}
                className="mt-2 text-2xl font-semibold tracking-tight"
              >
                Statistics
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-xl leading-none text-[color:var(--muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]"
              aria-label="Close statistics"
            >
              ×
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Played" value={played} />
            <StatTile label="Win %" value={winRatePercent(stats)} />
            <StatTile label="Current streak" value={stats.currentStreak} />
            <StatTile label="Max streak" value={stats.maxStreak} />
          </dl>

          <h3 className="mt-6 text-sm font-semibold text-[color:var(--foreground)]">
            Guess distribution
          </h3>
          <ol className="mt-3 flex flex-col gap-2" aria-label="Wins by guess count">
            {stats.guessDistribution.map((count, index) => {
              const guesses = index + 1;
              const width = `${Math.max(count > 0 ? 12 : 8, (count / maxBar) * 100)}%`;
              const highlight = todayGuesses === guesses;
              return (
                <li key={guesses} className="flex items-center gap-2 text-sm">
                  <span className="w-4 shrink-0 font-mono text-[color:var(--muted)]">
                    {guesses}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`flex min-h-7 items-center justify-end rounded px-2 font-mono text-xs ${
                        highlight
                          ? "bg-[color:var(--accent)] text-[#1a1408]"
                          : "bg-white/10 text-[color:var(--foreground)]"
                      }`}
                      style={{ width }}
                    >
                      {count}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="sr-only">
            Distribution covers wins in 1 through {MAX_GUESSES} guesses. Losses
            are not added to the bars.
          </p>

          <p className="mt-5 text-xs leading-5 text-[color:var(--muted)]">
            Stored only in this browser. No account, no cloud sync, and no
            leaderboard. A loss still counts as played and breaks the win
            streak. Same-day replay does not count twice.
          </p>
        </div>
      </dialog>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 px-3 py-3 text-center">
      <dt className="text-[11px] leading-4 text-[color:var(--muted)] sm:text-xs">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-[color:var(--foreground)]">
        {value}
      </dd>
    </div>
  );
}

export function ViewStatsButton() {
  return (
    <button
      type="button"
      onClick={openStatsPanel}
      className="mt-4 inline-flex min-h-12 items-center text-sm font-semibold text-[color:var(--accent)] underline-offset-4 hover:underline"
    >
      View stats
    </button>
  );
}
