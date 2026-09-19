/**
 * Theme week windows, homepage badge, and spoiler-free theme pages.
 *
 * UTC day keys are YYYY-MM-DD — the same keys `getDailyPuzzleDate` uses.
 * Inclusive start, inclusive end. The instant 23:59:59.999Z still belongs
 * to that calendar day; 00:00:00.000Z the next day does not.
 */
import { loadBundledCatalog } from "../lib/catalog/bundled";
import { acceptedAnswersForGame } from "../lib/daily/guess";
import { getDailyPuzzleDate } from "../lib/daily/date";
import {
  formatThemeUtcRange,
  getActiveTheme,
  getThemeBySlug,
  getThemePageCopy,
  isThemeActive,
  listPublishedPuzzleDates,
  listThemesNewestFirst,
  THEME_BADGE_CLASSNAME,
  themeCopyContainsAnswer,
  themeOneLiner,
} from "../lib/themes";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expect(condition: unknown, message: string): void {
  if (!condition) fail(message);
}

const catalog = loadBundledCatalog();
const autumn = getThemeBySlug(catalog.themes, "autumn-showcase");
const indie = getThemeBySlug(catalog.themes, "indie-first-week");
if (!autumn || !indie) fail("seed must include autumn-showcase and indie-first-week");

expect(catalog.themes.length >= 1, "seed at least one theme");
expect(autumn.start_date === "2026-09-15", "autumn start_date");
expect(autumn.end_date === "2026-09-21", "autumn end_date");
expect(indie.slug === "indie-first-week", "indie slug");
expect(autumn.description !== indie.description, "theme descriptions must be unique");
expect(autumn.description.length >= 80, "autumn description is a real paragraph");
console.log("ok — seeded themes");

// Inclusive UTC window: day before start, start, end, day after end.
expect(!isThemeActive(autumn, "2026-09-14"), "day before start is inactive");
expect(isThemeActive(autumn, "2026-09-15"), "start date is active");
expect(isThemeActive(autumn, "2026-09-19"), "mid-window is active");
expect(isThemeActive(autumn, "2026-09-21"), "end date is active");
expect(!isThemeActive(autumn, "2026-09-22"), "day after end is inactive");

expect(!isThemeActive(indie, "2026-01-11"), "indie day before start");
expect(isThemeActive(indie, "2026-01-12"), "indie start");
expect(isThemeActive(indie, "2026-01-18"), "indie end");
expect(!isThemeActive(indie, "2026-01-19"), "indie day after end");
console.log("ok — inclusive UTC date window");

// Instant boundaries: 23:59:59.999Z is still that UTC day; 00:00:00.000Z rolls.
const beforeStart = getDailyPuzzleDate(
  {},
  new Date("2026-09-14T23:59:59.999Z"),
);
const atStart = getDailyPuzzleDate({}, new Date("2026-09-15T00:00:00.000Z"));
const beforeEndRoll = getDailyPuzzleDate(
  {},
  new Date("2026-09-21T23:59:59.999Z"),
);
const afterEnd = getDailyPuzzleDate({}, new Date("2026-09-22T00:00:00.000Z"));

expect(beforeStart === "2026-09-14", `14th 23:59:59.999Z is 2026-09-14, got ${beforeStart}`);
expect(atStart === "2026-09-15", `15th 00:00:00.000Z is 2026-09-15, got ${atStart}`);
expect(beforeEndRoll === "2026-09-21", `21st 23:59:59.999Z is 2026-09-21, got ${beforeEndRoll}`);
expect(afterEnd === "2026-09-22", `22nd 00:00:00.000Z is 2026-09-22, got ${afterEnd}`);

expect(getActiveTheme(catalog.themes, beforeStart)?.slug === undefined, "badge hidden before start");
expect(getActiveTheme(catalog.themes, atStart)?.slug === "autumn-showcase", "badge at start instant");
expect(
  getActiveTheme(catalog.themes, beforeEndRoll)?.slug === "autumn-showcase",
  "badge still current at 23:59:59.999Z on end date",
);
expect(getActiveTheme(catalog.themes, afterEnd) === null, "badge hidden after end instant");
expect(getActiveTheme(catalog.themes, "2026-01-15")?.slug === "indie-first-week", "January window");
expect(getActiveTheme(catalog.themes, "2026-06-01") === null, "gap month has no theme");
console.log("ok — UTC instant boundaries + hide badge when none");

const autumnOn19 = getThemePageCopy(catalog, "autumn-showcase", "2026-09-19");
if (!autumnOn19) fail("autumn-showcase copy");
expect(autumnOn19.title === "Autumn Showcase", "unique H1 title");
expect(autumnOn19.description.includes("September ThemeShot week"), "unique description paragraph");
expect(autumnOn19.publishedDates.includes("2026-09-18"), "published 18th listed");
expect(autumnOn19.publishedDates.includes("2026-09-19"), "published 19th listed");
expect(!autumnOn19.publishedDates.includes("2026-09-20"), "future 20th hidden on the 19th");
expect(!autumnOn19.publishedDates.includes("2026-09-21"), "future 21st hidden on the 19th");
expect(autumnOn19.isCurrent, "autumn is current on 19 Sep");

const autumnOn21 = getThemePageCopy(catalog, "autumn-showcase", "2026-09-21");
expect(autumnOn21?.publishedDates.includes("2026-09-21") === true, "end date lists that day's puzzle");

const autumnOn22 = getThemePageCopy(catalog, "autumn-showcase", "2026-09-22");
expect(autumnOn22?.isCurrent === false, "after end is not current");
expect(autumnOn22?.publishedDates.includes("2026-09-21") === true, "past week still lists published dates");

const indieCopy = getThemePageCopy(catalog, "indie-first-week", "2026-09-19");
expect(indieCopy?.publishedDates.join(",") === "2026-01-15,2026-01-16", "historical published dates");
expect(indieCopy?.isCurrent === false, "January theme is not current in September");
expect(getThemePageCopy(catalog, "not-a-theme", "2026-09-19") === null, "unknown slug");
console.log("ok — theme page copy + published dates");

const pulled = structuredClone(catalog);
const sep19 = pulled.daily_puzzles.find((p) => p.puzzle_date === "2026-09-19");
if (!sep19) fail("missing 2026-09-19");
sep19.status = "pulled";
expect(
  !listPublishedPuzzleDates(pulled, "t-autumn-showcase", "2026-09-19").includes(
    "2026-09-19",
  ),
  "pulled puzzles stay off the theme page",
);
console.log("ok — pulled puzzles omitted");

for (const theme of catalog.themes) {
  const copy = getThemePageCopy(catalog, theme.slug, theme.end_date);
  if (!copy) fail(`missing copy for ${theme.slug}`);
  for (const game of catalog.games) {
    const accepted = acceptedAnswersForGame(game);
    expect(
      !themeCopyContainsAnswer(copy, accepted),
      `${theme.slug} copy must not contain ${game.title}`,
    );
  }
}
console.log("ok — no answer spoilers on theme copy");

expect(
  themeOneLiner(autumn.description).endsWith("logo."),
  "homepage one-liner is the first sentence",
);
expect(
  formatThemeUtcRange("2026-09-15", "2026-09-21") ===
    "Sep 15, 2026 – Sep 21, 2026 (UTC)",
  "English UTC range label",
);
expect(
  listThemesNewestFirst(catalog.themes)[0]?.slug === "far-roads",
  "list newest start_date first",
);
console.log("ok — English labels + list order");

expect(!THEME_BADGE_CLASSNAME.includes("fixed"), "badge is not position:fixed");
expect(!THEME_BADGE_CLASSNAME.includes("sticky"), "badge is not position:sticky");
expect(!THEME_BADGE_CLASSNAME.includes("absolute"), "badge is not position:absolute");
expect(
  THEME_BADGE_CLASSNAME.includes("mt-6") && THEME_BADGE_CLASSNAME.includes("rounded-xl"),
  "badge stays in document flow above play",
);
console.log("ok — mobile badge does not overlay play");

console.log("All theme week tests passed.");
