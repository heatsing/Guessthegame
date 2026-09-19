import { DAILY_STORAGE_KEY } from "./constants";
import { isFinished, type PlayState } from "./play";

export type StoredDailyFile = {
  version: 1;
  days: Record<string, PlayState>;
};

function emptyFile(): StoredDailyFile {
  return { version: 1, days: {} };
}

function parseFile(raw: string | null): StoredDailyFile {
  if (!raw) return emptyFile();
  try {
    const parsed = JSON.parse(raw) as StoredDailyFile;
    if (parsed?.version !== 1 || typeof parsed.days !== "object" || !parsed.days) {
      return emptyFile();
    }
    return parsed;
  } catch {
    return emptyFile();
  }
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

export function readDailyRun(date: string): PlayState | null {
  if (typeof window === "undefined") return null;
  try {
    const file = parseFile(window.localStorage.getItem(DAILY_STORAGE_KEY));
    const day = file.days[date];
    return isPlayState(day) && day.date === date ? day : null;
  } catch {
    return null;
  }
}

export function writeDailyRun(state: PlayState): void {
  if (typeof window === "undefined") return;
  try {
    const file = parseFile(window.localStorage.getItem(DAILY_STORAGE_KEY));
    file.days[state.date] = state;
    window.localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(file));
  } catch {
    // Private mode / quota — play still works for this tab.
  }
}

export function hasFinishedToday(date: string): boolean {
  const run = readDailyRun(date);
  return !!run && isFinished(run.status);
}
