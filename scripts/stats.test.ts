/**
 * Local stats + win-streak tests.
 *
 * UTC keys are mocked as `YYYY-MM-DD` strings — the same keys
 * `getDailyPuzzleDate` / daily play persist. To exercise this in a browser:
 * set `DAILY_PUZZLE_DATE`, or change the system clock to another UTC day.
 * Clearing `localStorage` key `themeshot.daily.v1` resets stats to empty.
 */
import { DAILY_FILE_VERSION, DAILY_STORAGE_KEY } from "../lib/daily/constants";
import { previousUtcDate, shiftUtcDate } from "../lib/daily/date";
import { createPlayState, type PlayState } from "../lib/daily/play";
import {
  emptyStats,
  liveCurrentStreak,
  playedCount,
  recordFinishedPlay,
  statsFromFinishedPlays,
  winRatePercent,
  withLiveStreak,
} from "../lib/daily/stats";
import {
  parseDailyFile,
  readDailyRun,
  readDailyStats,
  writeDailyRun,
} from "../lib/daily/storage";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expect(condition: unknown, message: string): void {
  if (!condition) fail(message);
}

function win(date: string, guesses = 1): PlayState {
  return {
    date,
    status: "won",
    guesses: Array.from({ length: guesses }, (_, index) => ({
      kind: "guess" as const,
      text: index === guesses - 1 ? "ok" : "miss",
      correct: index === guesses - 1,
    })),
  };
}

function lose(date: string): PlayState {
  return {
    date,
    status: "lost",
    guesses: Array.from({ length: 6 }, () => ({
      kind: "skip" as const,
      text: "Skip",
      correct: false,
    })),
  };
}

function installMemoryStorage() {
  const data = new Map<string, string>();
  const localStorage = {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };
  (
    globalThis as unknown as { window: { localStorage: typeof localStorage } }
  ).window = { localStorage };
  return data;
}

expect(shiftUtcDate("2026-01-01", -1) === "2025-12-31", "UTC date walks back a year");
expect(previousUtcDate("2026-03-01") === "2026-02-28", "UTC date handles Feb 2026");
expect(shiftUtcDate("2026-09-19", 1) === "2026-09-20", "UTC date walks forward");
console.log("ok — UTC date keys");

const empty = emptyStats();
expect(empty.currentStreak === 0, "empty current streak is 0");
expect(empty.maxStreak === 0, "empty max streak is 0");
expect(playedCount(empty) === 0, "empty played is 0");
expect(winRatePercent(empty) === 0, "empty win rate is 0");
expect(
  statsFromFinishedPlays([createPlayState("2026-09-19")]).playedDates.length === 0,
  "in-progress run is not played",
);
console.log("ok — empty / in-progress");

const twoWins = statsFromFinishedPlays([
  win("2026-09-18", 3),
  win("2026-09-19", 2),
]);
expect(twoWins.currentStreak === 2, "two consecutive UTC wins → streak 2");
expect(twoWins.maxStreak === 2, "two consecutive UTC wins → max 2");
expect(twoWins.wins === 2, "two wins counted");
expect(twoWins.losses === 0, "no losses");
expect(twoWins.playedDates.join(",") === "2026-09-18,2026-09-19", "played dates recorded");
expect(twoWins.guessDistribution[1] === 1, "2-guess win in distribution");
expect(twoWins.guessDistribution[2] === 1, "3-guess win in distribution");
expect(winRatePercent(twoWins) === 100, "two wins is 100%");
console.log("ok — consecutive wins streak=2");

let sequential = emptyStats();
sequential = recordFinishedPlay(sequential, win("2026-09-18", 1));
sequential = recordFinishedPlay(sequential, win("2026-09-19", 4));
expect(sequential.currentStreak === 2, "recordFinishedPlay consecutive wins → 2");
expect(sequential.guessDistribution[0] === 1, "1-guess win recorded");
expect(sequential.guessDistribution[3] === 1, "4-guess win recorded");

const replay = recordFinishedPlay(sequential, win("2026-09-19", 1));
expect(replay.wins === sequential.wins, "same-day replay does not add a win");
expect(replay.currentStreak === sequential.currentStreak, "same-day replay leaves streak");
expect(replay.guessDistribution[0] === sequential.guessDistribution[0], "same-day replay leaves distribution");

const duplicateList = statsFromFinishedPlays([
  win("2026-09-19", 3),
  win("2026-09-19", 1),
]);
expect(duplicateList.wins === 1, "first finish for a date wins");
expect(duplicateList.guessDistribution[2] === 1, "first 3-guess result is kept");
expect(duplicateList.guessDistribution[0] === 0, "later same-day win is ignored");
console.log("ok — same-day replay is not double-counted");

const broken = statsFromFinishedPlays([
  win("2026-09-17", 1),
  win("2026-09-18", 1),
  lose("2026-09-19"),
]);
expect(broken.playedDates.length === 3, "loss counts as played");
expect(broken.wins === 2, "prior wins kept");
expect(broken.losses === 1, "loss counted");
expect(broken.currentStreak === 0, "loss breaks the win streak");
expect(broken.maxStreak === 2, "max streak survives a loss");
expect(
  broken.guessDistribution.every((count) => count === 0 || count === 2 || count === 1),
  "distribution only has wins",
);
expect(
  broken.guessDistribution.reduce((sum, count) => sum + count, 0) === 2,
  "losses are not added to guess distribution",
);

let afterLoss = emptyStats();
afterLoss = recordFinishedPlay(afterLoss, win("2026-09-18"));
afterLoss = recordFinishedPlay(afterLoss, lose("2026-09-19"));
expect(afterLoss.currentStreak === 0, "recordFinishedPlay loss → streak 0");
expect(afterLoss.losses === 1, "recordFinishedPlay counts the loss");
afterLoss = recordFinishedPlay(afterLoss, win("2026-09-20"));
expect(afterLoss.currentStreak === 1, "win after a loss starts at 1");
expect(afterLoss.maxStreak === 1, "max is 1 when the only run was a single win then a loss");
console.log("ok — loss breaks win streak and still counts as played");

const gapped = statsFromFinishedPlays([
  win("2026-09-17", 2),
  win("2026-09-19", 2),
]);
expect(gapped.currentStreak === 1, "missed UTC day starts a new streak at 1");
expect(gapped.maxStreak === 1, "gap means no 2-day run");

const expired = liveCurrentStreak(twoWins, "2026-09-21");
expect(expired === 0, "live streak is 0 after skipping a UTC day");
expect(liveCurrentStreak(twoWins, "2026-09-19") === 2, "live streak holds on the last played day");
expect(liveCurrentStreak(twoWins, "2026-09-20") === 2, "live streak still holds the next UTC morning");
expect(withLiveStreak(twoWins, "2026-09-22").currentStreak === 0, "withLiveStreak expires");
expect(withLiveStreak(twoWins, "2026-09-22").maxStreak === 2, "max streak does not expire");
console.log("ok — missed UTC day breaks the live streak");

const sixGuess = statsFromFinishedPlays([win("2026-09-19", 6)]);
expect(sixGuess.guessDistribution[5] === 1, "6-guess win lands in slot 6");
console.log("ok — guess distribution 1–6");

const store = installMemoryStorage();
expect(readDailyStats("2026-09-19").playedDates.length === 0, "missing storage is empty");

writeDailyRun(createPlayState("2026-09-19"));
expect(readDailyStats("2026-09-19").wins === 0, "in-progress write is not a play");
expect(readDailyRun("2026-09-19")?.status === "playing", "in-progress run is stored");

writeDailyRun(win("2026-09-18", 2));
writeDailyRun(win("2026-09-19", 3));
const persisted = readDailyStats("2026-09-19");
expect(persisted.currentStreak === 2, "storage: two UTC wins → streak 2");
expect(persisted.wins === 2, "storage: wins persist");
expect(readDailyRun("2026-09-19")?.guesses.length === 3, "storage: today run persists");

writeDailyRun(win("2026-09-19", 3));
writeDailyRun(win("2026-09-19", 1));
expect(readDailyStats("2026-09-19").wins === 2, "storage: rewriting today does not add a play");
expect(readDailyRun("2026-09-19")?.guesses.length === 3, "storage: first finish is kept");
expect(readDailyStats("2026-09-19").guessDistribution[0] === 0, "storage: first finish keeps 3-guess win");
expect(readDailyStats("2026-09-19").guessDistribution[2] === 1, "storage: distribution stays on first finish");

const raw = store.get(DAILY_STORAGE_KEY);
expect(typeof raw === "string", "file is written");
const file = parseDailyFile(raw ?? null);
expect(file.version === DAILY_FILE_VERSION, "written file is version 2");
expect(file.stats.currentStreak === 2, "written stats match days");
console.log("ok — localStorage persist / same-day rewrite");

store.clear();
expect(readDailyStats("2026-09-19").playedDates.length === 0, "cleared storage is empty");

store.set(
  DAILY_STORAGE_KEY,
  JSON.stringify({
    version: 1,
    days: {
      "2026-09-18": win("2026-09-18", 1),
      "2026-09-19": win("2026-09-19", 4),
    },
  }),
);
const migrated = readDailyStats("2026-09-19");
expect(migrated.currentStreak === 2, "v1 days migrate to streak 2");
expect(migrated.wins === 2, "v1 days migrate wins");
expect(migrated.guessDistribution[3] === 1, "v1 days migrate distribution");

writeDailyRun(lose("2026-09-20"));
const afterMigrateWrite = parseDailyFile(store.get(DAILY_STORAGE_KEY) ?? null);
expect(afterMigrateWrite.version === DAILY_FILE_VERSION, "migrated file is rewritten as v2");
expect(afterMigrateWrite.stats.currentStreak === 0, "loss after migrated wins breaks streak");
expect(afterMigrateWrite.stats.maxStreak === 2, "migrated max streak is kept");
expect(afterMigrateWrite.stats.losses === 1, "loss after migrate is recorded");
console.log("ok — v1 themeshot.daily.v1 migration");

store.set(DAILY_STORAGE_KEY, "{not json");
expect(readDailyStats().wins === 0, "corrupt JSON is treated as empty");
store.set(DAILY_STORAGE_KEY, JSON.stringify({ version: 99, days: {} }));
expect(readDailyStats().wins === 0, "unknown file version is treated as empty");
console.log("ok — corrupt / unknown version");

console.log("All stats tests passed.");
