import { DAILY_FILE_VERSION, DAILY_STORAGE_KEY } from "./constants";
import { isFinished, type PlayState } from "./play";
import {
  emptyStats,
  statsFromDays,
  withLiveStreak,
  type DailyStats,
} from "./stats";

export type StoredDailyFile = {
  version: typeof DAILY_FILE_VERSION;
  days: Record<string, PlayState>;
  stats: DailyStats;
};

function emptyFile(): StoredDailyFile {
  return { version: DAILY_FILE_VERSION, days: {}, stats: emptyStats() };
}

function isPlayState(value: unknown): value is PlayState {
  if (!value || typeof value !== "object") return false;
  const record = value as PlayState;
  return (
    typeof record.date === "string" &&
    Array.isArray(record.guesses) &&
    (record.status === "playing" ||
      record.status === "won" ||
      record.status === "lost")
  );
}

function parseDays(value: unknown): Record<string, PlayState> {
  if (!value || typeof value !== "object") return {};
  const days: Record<string, PlayState> = {};
  for (const [key, day] of Object.entries(value as Record<string, unknown>)) {
    if (isPlayState(day) && day.date === key) {
      days[key] = day;
    }
  }
  return days;
}

function fileFromDays(days: Record<string, PlayState>): StoredDailyFile {
  return {
    version: DAILY_FILE_VERSION,
    days,
    stats: statsFromDays(days),
  };
}

/**
 * Read `themeshot.daily.v1`.
 *
 * v1 documents (Issue #3) only stored `days`. They migrate in memory to
 * version 2 by deriving stats from finished runs. Unknown versions start empty
 * rather than guessing.
 */
export function parseDailyFile(raw: string | null): StoredDailyFile {
  if (!raw) return emptyFile();
  try {
    const parsed = JSON.parse(raw) as {
      version?: unknown;
      days?: unknown;
    };
    if (!parsed || typeof parsed !== "object") return emptyFile();
    if (parsed.version !== 1 && parsed.version !== DAILY_FILE_VERSION) {
      return emptyFile();
    }
    return fileFromDays(parseDays(parsed.days));
  } catch {
    return emptyFile();
  }
}

function readFile(): StoredDailyFile {
  if (typeof window === "undefined") return emptyFile();
  try {
    return parseDailyFile(window.localStorage.getItem(DAILY_STORAGE_KEY));
  } catch {
    return emptyFile();
  }
}

function writeFile(file: StoredDailyFile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(file));
  } catch {
    // Private mode / quota — play still works for this tab.
  }
}

export function readDailyRun(date: string): PlayState | null {
  const day = readFile().days[date];
  return day && day.date === date ? day : null;
}

export function writeDailyRun(state: PlayState): void {
  const file = readFile();
  const existing = file.days[state.date];
  if (existing && isFinished(existing.status)) {
    // First finished run for this UTC date is authoritative — same-day
    // replay must not replace it or increment stats again.
    return;
  }
  file.days[state.date] = state;
  writeFile(fileFromDays(file.days));
}

export function hasFinishedToday(date: string): boolean {
  const run = readDailyRun(date);
  return !!run && isFinished(run.status);
}

export function readDailyStats(today?: string): DailyStats {
  const stats = statsFromDays(readFile().days);
  return today ? withLiveStreak(stats, today) : stats;
}
