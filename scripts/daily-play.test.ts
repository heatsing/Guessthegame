import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadBundledCatalog } from "../lib/catalog/bundled";
import { getDailyPuzzleDate } from "../lib/daily/date";
import { guessMatchesAnswer, normalizeGuess } from "../lib/daily/guess";
import {
  getDailyPublicCopy,
  getPlayableDaily,
  publicCopyContainsAnswer,
} from "../lib/daily/load-puzzle";
import {
  applyGuess,
  applySkip,
  createPlayState,
  revealedScreenshotCount,
} from "../lib/daily/play";
import {
  SHARE_EMOJI,
  SHARE_SITE_NAME,
  SHARE_URL,
  buildShareText,
} from "../lib/daily/share";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expect(condition: unknown, message: string): void {
  if (!condition) fail(message);
}

const catalog = loadBundledCatalog();
const hades = catalog.games.find((game) => game.id === "g-hades");
if (!hades) fail("seed must include Hades");

const accepted = [hades.title, ...hades.aliases.en, ...hades.aliases.zh, ...hades.aliases.ja];

expect(normalizeGuess("  HADES  ") === "hades", "normalizeGuess trims and lowercases");
expect(guessMatchesAnswer("hades", accepted), "title matches case-insensitively");
expect(guessMatchesAnswer("Hades I", accepted), "English alias matches");
expect(guessMatchesAnswer("  哈迪斯  ", accepted), "Chinese alias matches");
expect(guessMatchesAnswer("ハデス", accepted), "Japanese alias matches");
expect(!guessMatchesAnswer("Celeste", accepted), "wrong title must not match");
expect(!guessMatchesAnswer("   ", accepted), "blank guess must not match");
console.log("ok — guess matching");

const today = getPlayableDaily(catalog, "2026-09-19");
if (!today) fail("2026-09-19 must have a playable seed puzzle");
expect(today.answer.title === "Hades", "today seed is Hades");
expect(today.screenshots.length === 6, "today seed reveals 6 screenshots");
expect(
  today.screenshots.every((shot) => !shot.src.includes("steam")),
  "playable shots must not use Steam CDN",
);
console.log("ok — 2026-09-19 seed");

expect(getPlayableDaily(catalog, "2099-01-01") === null, "missing date is empty");
const publicCopy = getDailyPublicCopy(catalog, "2026-09-19");
expect(publicCopy.hasPuzzle, "public copy reports a puzzle");
expect(
  !publicCopyContainsAnswer(publicCopy, today.answer.accepted),
  "public copy must not include the answer",
);
console.log("ok — empty / public copy");

const steamCatalog = structuredClone(catalog);
const firstHadesShot = steamCatalog.media_assets.find((asset) => asset.id === "m-hades-01");
if (!firstHadesShot) fail("missing m-hades-01");
firstHadesShot.storage_url =
  "https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg";
const filtered = getPlayableDaily(steamCatalog, "2026-01-15");
expect(filtered !== null, "Jan 15 still playable after dropping one Steam URL");
expect(
  filtered?.screenshots.every((shot) => shot.id !== "m-hades-01") ?? false,
  "Steam CDN shot is omitted",
);
console.log("ok — Steam CDN shots filtered");

let play = createPlayState("2026-09-19");
expect(revealedScreenshotCount(play, 6) === 1, "start on screenshot 1");
play = applyGuess(play, "Celeste", accepted);
expect(play.status === "playing", "wrong guess stays in play");
expect(play.guesses.length === 1, "wrong guess consumes a slot");
expect(revealedScreenshotCount(play, 6) === 2, "wrong guess reveals next shot");
const afterDup = applyGuess(play, "celeste", accepted);
expect(afterDup.guesses.length === 1, "duplicate guess is ignored");
play = applySkip(play);
expect(play.guesses[1]?.kind === "skip", "skip is recorded");
expect(revealedScreenshotCount(play, 6) === 3, "skip reveals next shot");
play = applyGuess(play, "哈迪斯", accepted);
expect(play.status === "won", "alias win ends early");
expect(revealedScreenshotCount(play, 6) === 6, "win reveals every shot");
console.log("ok — progressive reveal + early win");

let lose = createPlayState("2026-09-19");
for (let i = 0; i < 6; i += 1) lose = applySkip(lose);
expect(lose.status === "lost", "six skips lose");
expect(lose.guesses.length === 6, "six skips consume every slot");
expect(revealedScreenshotCount(lose, 6) === 6, "lose reveals every shot");
const ignored = applyGuess(lose, "Hades", accepted);
expect(ignored.status === "lost", "finished run ignores more guesses");
console.log("ok — lose path");

expect(
  getDailyPuzzleDate({ DAILY_PUZZLE_DATE: "2026-01-15" }, new Date("2026-09-19T12:00:00.000Z")) ===
    "2026-01-15",
  "DAILY_PUZZLE_DATE overrides the UTC day",
);
expect(
  getDailyPuzzleDate({}, new Date("2026-09-19T00:30:00.000Z")) === "2026-09-19",
  "real UTC date is used when unset",
);
console.log("ok — date helper");

function expectShareText(text: string, acceptedTitles: readonly string[], label: string) {
  expect(text.includes(SHARE_SITE_NAME), `${label} includes site name`);
  expect(text.includes("2026-09-19"), `${label} includes puzzle date`);
  expect(text.includes(SHARE_URL), `${label} includes guessthegame.net link`);
  expect(!text.toLowerCase().includes("hades"), `${label} omits the answer title`);
  for (const title of acceptedTitles) {
    const needle = title.trim();
    if (!needle) continue;
    expect(
      !text.includes(needle) && !text.toLowerCase().includes(needle.toLowerCase()),
      `${label} must not include accepted title "${needle}"`,
    );
  }
  expect(!text.includes("Celeste"), `${label} omits typed wrong guesses`);
  expect(!text.includes("Skip"), `${label} omits skip labels`);
}

const winShare = buildShareText(play);
expectShareText(winShare, accepted, "win share");
expect(winShare.includes(`${SHARE_EMOJI.miss}${SHARE_EMOJI.skip}${SHARE_EMOJI.hit}`), "win grid is miss/skip/hit");
expect(winShare.includes("3/6"), "win share reports 3/6");
expect(!winShare.includes("X/6"), "win share does not use X/6");
console.log("ok — win share text");

const loseShare = buildShareText(lose);
expectShareText(loseShare, accepted, "lose share");
expect(
  loseShare.includes(
    `${SHARE_EMOJI.skip}${SHARE_EMOJI.skip}${SHARE_EMOJI.skip}${SHARE_EMOJI.skip}${SHARE_EMOJI.skip}${SHARE_EMOJI.skip}`,
  ),
  "lose grid is six skips",
);
expect(loseShare.includes("X/6"), "lose share reports X/6");
expect(!/\n6\/6\n/.test(`\n${loseShare}\n`), "lose share does not look like a 6/6 win");
console.log("ok — lose share text");

let missLose = createPlayState("2026-09-19");
for (const title of [
  "Celeste",
  "Stardew Valley",
  "Hollow Knight",
  "Portal 2",
  "Undertale",
  "Outer Wilds",
]) {
  missLose = applyGuess(missLose, title, accepted);
}
expect(missLose.status === "lost", "six misses lose");
const missShare = buildShareText(missLose);
expectShareText(missShare, accepted, "miss-lose share");
expect(
  missShare.includes(
    `${SHARE_EMOJI.miss}${SHARE_EMOJI.miss}${SHARE_EMOJI.miss}${SHARE_EMOJI.miss}${SHARE_EMOJI.miss}${SHARE_EMOJI.miss}`,
  ),
  "six-miss grid is all misses",
);
expect(missShare.includes("X/6"), "six-miss share reports X/6");
console.log("ok — miss-lose share text");

const spoilerFiles = [
  "app/page.tsx",
  "app/layout.tsx",
  "components/Header.tsx",
  "components/Footer.tsx",
  "components/daily/DailyPlay.tsx",
  "components/daily/EmptyPuzzle.tsx",
  "components/daily/GuessInput.tsx",
  "components/daily/GuessAutocomplete.tsx",
  "components/daily/PuzzleBoard.tsx",
  "components/daily/ScreenshotReveal.tsx",
  "components/daily/ShareResults.tsx",
  "lib/daily/share.ts",
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
console.log("ok — no-JS source files omit answer strings");

const placeholderDir = join(process.cwd(), "public/media/placeholders");
const playablePlaceholders = [
  "hades-01.svg",
  "hades-02.svg",
  "hades-03.svg",
  "hades-04.svg",
  "hades-05.svg",
  "hades-06.svg",
  "celeste-01.svg",
  "celeste-02.svg",
  "hollow-knight-01.svg",
  "stardew-01.svg",
];
for (const name of playablePlaceholders) {
  const svg = readFileSync(join(placeholderDir, name), "utf8");
  for (const needle of spoilers) {
    if (svg.includes(needle)) {
      fail(`playable placeholder ${name} must not contain "${needle}"`);
    }
  }
}
console.log("ok — playable placeholders omit answer strings");

console.log("All daily play tests passed.");
