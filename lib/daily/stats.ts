import { MAX_GUESSES } from "./constants";
import { previousUtcDate } from "./date";
import { isFinished, type PlayState } from "./play";

export type GuessDistribution = [
  number,
  number,
  number,
  number,
  number,
  number,
];

/**
 * Local lifetime stats (no account, no PII).
 *
 * `playedDates` are finished UTC puzzle keys only. In-progress runs do not
 * count. `guessDistribution[i]` is wins finished in `i + 1` guesses (1–6).
 * Losses are not added to the distribution.
 */
export type DailyStats = {
  playedDates: string[];
  currentStreak: number;
  maxStreak: number;
  guessDistribution: GuessDistribution;
  wins: number;
  losses: number;
};

export function emptyGuessDistribution(): GuessDistribution {
  return [0, 0, 0, 0, 0, 0];
}

export function emptyStats(): DailyStats {
  return {
    playedDates: [],
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: emptyGuessDistribution(),
    wins: 0,
    losses: 0,
  };
}

export function playedCount(stats: DailyStats): number {
  return stats.wins + stats.losses;
}

export function winRatePercent(stats: DailyStats): number {
  const played = playedCount(stats);
  if (played === 0) return 0;
  return Math.round((stats.wins / played) * 100);
}

/**
 * Lose-breaks-win-streak (locked MVP rule):
 *
 * - A finished **loss still counts as played** (`playedDates` + `losses++`).
 * - A loss **sets `currentStreak` to 0**. It does not increment the win streak.
 * - Only **consecutive UTC-day wins** grow the streak. Winning after a loss
 *   starts again at 1.
 * - A **missed UTC day** (gap between finished dates, or a gap from the last
 *   finish to `today`) also breaks the win streak. Winning after a gap starts
 *   at 1. See `liveCurrentStreak`.
 *
 * Same-day replay must not double-count: the first finished `PlayState` for a
 * UTC date wins. Later records for that date are ignored.
 *
 * Production storage recomputes via `statsFromDays` so existing
 * `themeshot.daily.v1` day maps stay the source of truth.
 */
export function statsFromFinishedPlays(
  plays: readonly PlayState[],
): DailyStats {
  const byDate = new Map<string, PlayState>();
  for (const play of plays) {
    if (!isFinished(play.status)) continue;
    if (byDate.has(play.date)) continue;
    byDate.set(play.date, play);
  }

  const finished = [...byDate.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const guessDistribution = emptyGuessDistribution();
  let wins = 0;
  let losses = 0;

  for (const play of finished) {
    if (play.status === "won") {
      wins += 1;
      const guesses = play.guesses.length;
      if (guesses >= 1 && guesses <= MAX_GUESSES) {
        guessDistribution[guesses - 1] += 1;
      }
    } else {
      losses += 1;
    }
  }

  const { currentStreak, maxStreak } = computeWinStreaks(finished);

  return {
    playedDates: finished.map((play) => play.date),
    currentStreak,
    maxStreak,
    guessDistribution,
    wins,
    losses,
  };
}

export function statsFromDays(days: Record<string, PlayState>): DailyStats {
  return statsFromFinishedPlays(Object.values(days));
}

/**
 * Record one newly finished run.
 *
 * Same-day replay (`play.date` already in `playedDates`) is a no-op.
 * Callers that already have the full `days` map should prefer
 * `statsFromDays` so streak history cannot drift.
 */
export function recordFinishedPlay(
  stats: DailyStats,
  play: PlayState,
): DailyStats {
  if (!isFinished(play.status)) return stats;
  if (stats.playedDates.includes(play.date)) return stats;

  const nextDates = [...stats.playedDates, play.date].sort((a, b) =>
    a.localeCompare(b),
  );
  const lastBefore = stats.playedDates[stats.playedDates.length - 1] ?? null;
  const guessDistribution: GuessDistribution = [
    ...stats.guessDistribution,
  ];

  if (play.status === "lost") {
    return {
      playedDates: nextDates,
      currentStreak: 0,
      maxStreak: stats.maxStreak,
      guessDistribution,
      wins: stats.wins,
      losses: stats.losses + 1,
    };
  }

  const guesses = play.guesses.length;
  if (guesses >= 1 && guesses <= MAX_GUESSES) {
    guessDistribution[guesses - 1] += 1;
  }

  const continues =
    lastBefore !== null &&
    previousUtcDate(play.date) === lastBefore &&
    stats.currentStreak > 0;
  const currentStreak = continues ? stats.currentStreak + 1 : 1;

  return {
    playedDates: nextDates,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    guessDistribution,
    wins: stats.wins + 1,
    losses: stats.losses,
  };
}

/**
 * Streak as of `today` (UTC `YYYY-MM-DD`).
 *
 * Historical `currentStreak` is the win run ending on the last finished day.
 * If that day is neither today nor yesterday, the player missed a UTC day and
 * the live streak is 0 — even though `maxStreak` is unchanged.
 */
export function liveCurrentStreak(stats: DailyStats, today: string): number {
  const last = stats.playedDates[stats.playedDates.length - 1];
  if (!last) return 0;
  if (last === today || last === previousUtcDate(today)) {
    return stats.currentStreak;
  }
  return 0;
}

export function withLiveStreak(stats: DailyStats, today: string): DailyStats {
  return { ...stats, currentStreak: liveCurrentStreak(stats, today) };
}

function computeWinStreaks(finishedSorted: readonly PlayState[]): {
  currentStreak: number;
  maxStreak: number;
} {
  let maxStreak = 0;
  let run = 0;
  let prevDate: string | null = null;

  for (const play of finishedSorted) {
    if (play.status === "won") {
      const continues =
        prevDate !== null && previousUtcDate(play.date) === prevDate && run > 0;
      run = continues ? run + 1 : 1;
    } else {
      // Loss: played, but the win streak ends.
      run = 0;
    }
    maxStreak = Math.max(maxStreak, run);
    prevDate = play.date;
  }

  let currentStreak = 0;
  const last = finishedSorted[finishedSorted.length - 1];
  if (last?.status === "won") {
    for (let i = finishedSorted.length - 1; i >= 0; i -= 1) {
      const play = finishedSorted[i];
      if (play.status !== "won") break;
      const later = finishedSorted[i + 1];
      if (later && previousUtcDate(later.date) !== play.date) break;
      currentStreak += 1;
    }
  }

  return { currentStreak, maxStreak };
}
