/**
 * Archive hub + /puzzle/[date] access rules.
 *
 * UTC keys are mocked as `YYYY-MM-DD` strings — the same keys
 * `getDailyPuzzleDate` uses. Future/unpublished/invalid dates must stay closed
 * even when a seed row exists.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadBundledCatalog } from "../lib/catalog/bundled";
import {
  listArchiveDates,
  playedArchiveDates,
  resolveReplayPuzzle,
  selectArchiveDates,
} from "../lib/daily/archive";
import { ARCHIVE_LIMIT } from "../lib/daily/constants";
import {
  getDailyPuzzleDate,
  isValidUtcIsoDate,
  previousUtcDate,
  shiftUtcDate,
} from "../lib/daily/date";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expect(condition: unknown, message: string): void {
  if (!condition) fail(message);
}

const catalog = loadBundledCatalog();
const today = "2026-09-19";
const yesterday = previousUtcDate(today);
const tomorrow = shiftUtcDate(today, 1);

expect(isValidUtcIsoDate("2026-09-19"), "real UTC day is valid");
expect(isValidUtcIsoDate("2026-02-28"), "Feb 28 2026 is valid");
expect(!isValidUtcIsoDate("2026-02-31"), "Feb 31 is not a calendar day");
expect(!isValidUtcIsoDate("2026-13-01"), "month 13 is invalid");
expect(!isValidUtcIsoDate("2026-9-19"), "unpadded month is invalid");
expect(!isValidUtcIsoDate("not-a-date"), "garbage is invalid");
console.log("ok — calendar date validation");

expect(resolveReplayPuzzle(catalog, today, today) !== null, "today is open");
expect(
  resolveReplayPuzzle(catalog, yesterday, today) !== null,
  "yesterday is open for replay",
);
expect(
  resolveReplayPuzzle(catalog, tomorrow, today) === null,
  "future published seed stays closed",
);
expect(
  resolveReplayPuzzle(catalog, "2026-09-21", today) === null,
  "later published seed stays closed",
);
expect(
  resolveReplayPuzzle(catalog, "2026-01-01", today) === null,
  "unpublished date is closed",
);
expect(
  resolveReplayPuzzle(catalog, "2026-02-31", today) === null,
  "invalid calendar date is closed",
);
expect(
  resolveReplayPuzzle(catalog, "nope", today) === null,
  "non-ISO date is closed",
);
console.log("ok — replay access");

const beforeMidnight = getDailyPuzzleDate(
  {},
  new Date("2026-09-18T23:59:59.999Z"),
);
expect(beforeMidnight === "2026-09-18", "UTC day has not rolled over yet");
expect(
  resolveReplayPuzzle(catalog, "2026-09-19", beforeMidnight) === null,
  "next UTC day is still future just before midnight",
);

const atMidnight = getDailyPuzzleDate({}, new Date("2026-09-19T00:00:00.000Z"));
expect(atMidnight === "2026-09-19", "UTC midnight opens the new day");
expect(
  resolveReplayPuzzle(catalog, "2026-09-19", atMidnight) !== null,
  "today opens at 00:00 UTC",
);

const lateDay = getDailyPuzzleDate({}, new Date("2026-09-19T23:59:59.999Z"));
expect(lateDay === "2026-09-19", "same UTC day until the next midnight");
expect(
  resolveReplayPuzzle(catalog, "2026-09-20", lateDay) === null,
  "tomorrow stays closed until the following midnight",
);
console.log("ok — timezone / UTC midnight boundary");

const dates = listArchiveDates(catalog, today);
expect(dates[0] === today, "archive lists newest open date first");
expect(dates.includes(yesterday), "yesterday is on the hub");
expect(dates.includes("2026-01-15"), "older published days are listed when under the cap");
expect(!dates.includes(tomorrow), "future dates are omitted from the hub");
expect(!dates.includes("2026-09-21"), "later future dates are omitted");
expect(
  dates.every((date, index) => index === 0 || dates[index - 1]! >= date),
  "archive dates are newest-first",
);
expect(dates.length <= ARCHIVE_LIMIT, "hub respects the 30-day cap");
console.log("ok — archive listing");

const many = Array.from({ length: 40 }, (_, index) =>
  shiftUtcDate(today, -index),
);
const capped = selectArchiveDates(many, today, () => true, ARCHIVE_LIMIT);
expect(capped.length === ARCHIVE_LIMIT, "selectArchiveDates caps at 30");
expect(capped[0] === today, "cap still starts at today");
expect(capped[29] === shiftUtcDate(today, -29), "30th entry is today-minus-29");
expect(
  !capped.includes(shiftUtcDate(today, -30)),
  "day 31 is dropped by the cap",
);

const withFuture = selectArchiveDates(
  [tomorrow, today, yesterday, today],
  today,
  (date) => date !== "skip",
);
expect(
  JSON.stringify(withFuture) === JSON.stringify([today, yesterday]),
  "duplicates and future keys are dropped",
);

const pulled = structuredClone(catalog);
const yesterdayRow = pulled.daily_puzzles.find(
  (puzzle) => puzzle.puzzle_date === yesterday,
);
if (!yesterdayRow) fail("seed must include yesterday");
yesterdayRow.status = "pulled";
expect(
  resolveReplayPuzzle(pulled, yesterday, today) === null,
  "pulled dates are not replayable",
);
expect(
  !listArchiveDates(pulled, today).includes(yesterday),
  "pulled dates are omitted from the hub",
);
console.log("ok — unpublished / pulled / cap");

expect(
  JSON.stringify(playedArchiveDates([today, yesterday], [yesterday, "2099-01-01"])) ===
    JSON.stringify([yesterday]),
  "played markers only apply to dates on the hub",
);
expect(
  playedArchiveDates([today, yesterday], []).length === 0,
  "empty localStorage marks nothing played",
);
console.log("ok — localStorage played markers");

const spoilerFiles = [
  "app/archive/page.tsx",
  "app/puzzle/[date]/page.tsx",
  "components/archive/ArchiveList.tsx",
  "lib/daily/archive.ts",
];
const spoilers = [
  "Hades",
  "Celeste",
  "Stardew",
  "Hollow Knight",
  "Portal 2",
  "哈迪斯",
  "蔚蓝",
  "星露谷",
];
for (const relative of spoilerFiles) {
  const source = readFileSync(join(process.cwd(), relative), "utf8");
  for (const needle of spoilers) {
    if (source.includes(needle)) {
      fail(`${relative} must not contain answer string "${needle}"`);
    }
  }
}
console.log("ok — archive / puzzle source omits answers");

console.log("All archive tests passed.");
