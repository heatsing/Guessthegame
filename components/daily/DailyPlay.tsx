"use client";

import { useEffect, useState } from "react";

import type { DailyApiResponse } from "@/lib/daily/api-types";
import {
  applyGuess,
  applySkip,
  createPlayState,
  type PlayState,
} from "@/lib/daily/play";
import { readDailyRun, writeDailyRun } from "@/lib/daily/storage";

import { EmptyPuzzle } from "./EmptyPuzzle";
import { PuzzleBoard } from "./PuzzleBoard";

type DailyPlayProps = {
  /** UTC `YYYY-MM-DD`. Omit to load today's puzzle from `/api/daily`. */
  date?: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; daily: DailyApiResponse; play: PlayState | null };

export function DailyPlay({ date }: DailyPlayProps = {}) {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const loadError = date
      ? "Could not load this puzzle."
      : "Could not load today's puzzle.";

    async function loadDaily() {
      try {
        const path = date
          ? `/api/daily?date=${encodeURIComponent(date)}`
          : "/api/daily";
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(loadError);
        }
        const daily = (await response.json()) as DailyApiResponse;
        if (cancelled) return;

        const stored = daily.ok ? readDailyRun(daily.date) : null;
        setLoad({
          status: "ready",
          daily,
          play: stored ?? (daily.ok ? createPlayState(daily.date) : null),
        });
      } catch (error) {
        if (cancelled) return;
        setLoad({
          status: "error",
          message: error instanceof Error ? error.message : loadError,
        });
      }
    }

    void loadDaily();
    return () => {
      cancelled = true;
    };
  }, [date]);

  function updatePlay(updater: (current: PlayState) => PlayState) {
    setLoad((current) => {
      if (current.status !== "ready" || !current.daily.ok) return current;
      const baseline = current.play ?? createPlayState(current.daily.date);
      const next = updater(baseline);
      writeDailyRun(next);
      return { ...current, play: next };
    });
  }

  if (load.status === "loading") {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center rounded-xl border border-white/10 bg-[color:var(--surface)] text-sm text-[color:var(--muted)]"
        role="status"
      >
        {date ? "Loading this ThemeShot…" : "Loading today's ThemeShot…"}
      </div>
    );
  }

  if (load.status === "error") {
    return (
      <div
        className="rounded-xl border border-white/10 bg-[color:var(--surface)] px-4 py-8 text-center text-sm text-[color:var(--muted)]"
        role="alert"
      >
        {load.message}
      </div>
    );
  }

  if (!load.daily.ok) {
    return <EmptyPuzzle date={load.daily.date} />;
  }

  const play = load.play ?? createPlayState(load.daily.date);
  const accepted = load.daily.answer.accepted;

  return (
    <PuzzleBoard
      daily={load.daily}
      play={play}
      onGuess={(value) => updatePlay((current) => applyGuess(current, value, accepted))}
      onSkip={() => updatePlay(applySkip)}
    />
  );
}
