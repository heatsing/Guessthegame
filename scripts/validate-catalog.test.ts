import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { readSeedCatalog } from "../lib/catalog/load";
import { getPlayableDaily } from "../lib/daily/load-puzzle";
import {
  validateLicenseArchives,
  validateLocalMediaFiles,
} from "../lib/catalog/local-media";
import { isSteamCdnUrl } from "../lib/catalog/steam";
import { validateCatalog, type Catalog } from "../lib/catalog";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expectFail(catalog: unknown, needle: string, label: string): void {
  const result = validateCatalog(catalog);
  if (result.ok) fail(`${label}: expected validation to fail`);
  const blob = result.issues.map((issue) => `${issue.path} ${issue.message}`).join("\n");
  if (!blob.toLowerCase().includes(needle.toLowerCase())) {
    fail(`${label}: expected an issue containing "${needle}", got:\n${blob}`);
  }
  console.log(`ok — ${label}`);
}

const steamSamples = [
  "https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg",
  "https://cdn.cloudflare.steamstatic.com/steam/apps/620/ss_01.jpg",
  "https://steamcdn-a.akamaihd.net/steam/apps/413150/header.jpg",
  "https://media.steampowered.com/steamcommunity/public/images/apps/620/foo.jpg",
  "//shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/hero.jpg",
];

for (const url of steamSamples) {
  if (!isSteamCdnUrl(url)) fail(`isSteamCdnUrl should reject ${url}`);
}
if (isSteamCdnUrl("/media/placeholders/hades-01.svg")) {
  fail("self-hosted relative path must not be treated as Steam CDN");
}
if (isSteamCdnUrl("https://guessthegame.net/media/hades-01.webp")) {
  fail("own-host URL must not be treated as Steam CDN");
}
console.log("ok — Steam CDN detector");

const seed = readSeedCatalog();
const good = validateCatalog(seed);
if (!good.ok) {
  fail(
    "legal seed must pass:\n" +
      good.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n"),
  );
}
console.log("ok — legal seed passes");

const catalog = good.catalog as Catalog;

const localMedia = validateLocalMediaFiles(catalog);
if (localMedia.length > 0) {
  fail("legal seed local media must pass:\n" + localMedia.map((i) => `${i.path} ${i.message}`).join("\n"));
}
const licenseArchives = validateLicenseArchives(catalog);
if (licenseArchives.length > 0) {
  fail(
    "legal seed license archives must pass:\n" +
      licenseArchives.map((i) => `${i.path} ${i.message}`).join("\n"),
  );
}
console.log("ok — local media + license archives");

const steamCatalog: Catalog = structuredClone(catalog);
steamCatalog.media_assets[0]!.storage_url =
  "https://cdn.akamai.steamstatic.com/steam/apps/1145360/header.jpg";
expectFail(steamCatalog, "Steam CDN", "Steam CDN storage_url");

const unknownMonetize: Catalog = structuredClone(catalog);
const rejectedUnknown = unknownMonetize.media_assets.find(
  (asset) => asset.rights_status === "unknown",
);
if (!rejectedUnknown) fail("seed should include one unknown/rejected asset");
rejectedUnknown.can_monetize = true;
expectFail(unknownMonetize, "can_monetize", "unknown + can_monetize");

const unknownApproved: Catalog = structuredClone(catalog);
const firstApproved = unknownApproved.media_assets.find(
  (asset) => asset.moderation_status === "approved",
);
if (!firstApproved) fail("seed should include an approved asset");
firstApproved.rights_status = "unknown";
expectFail(unknownApproved, "publishable", "unknown + approved");

const pressKit = catalog.media_assets.find((asset) => asset.id === "m-hades-pk-01");
if (!pressKit) fail("seed should include the press-kit intake example m-hades-pk-01");
if (pressKit.rights_status !== "press_kit") fail("m-hades-pk-01 must be press_kit");
if (pressKit.can_monetize) fail("pipeline demo must not set can_monetize");
if (pressKit.storage_url !== "/media/hades/m-hades-pk-01.svg") {
  fail("press-kit example must use the canonical /media/{slug}/{id} path");
}
const jan15 = catalog.daily_puzzles.find((puzzle) => puzzle.puzzle_date === "2026-01-15");
if (!jan15?.asset_ids.includes("m-hades-pk-01")) {
  fail("2026-01-15 must reference the press-kit intake example");
}
console.log("ok — press-kit intake example is catalogued and referenced");

const emptyLicensor: Catalog = structuredClone(catalog);
const known = emptyLicensor.media_assets.find((asset) => asset.rights_status === "press_kit");
if (!known) fail("seed should include a press_kit asset");
known.licensor = "   ";
expectFail(emptyLicensor, "licensor", "known rights require licensor");

const badPath: Catalog = structuredClone(catalog);
const named = badPath.media_assets.find((asset) => asset.id === "m-hades-pk-01");
if (!named) fail("missing m-hades-pk-01");
named.storage_url = "/media/misc/random.svg";
expectFail(badPath, "storage_url", "non-canonical /media/ path");

const takedownBare: Catalog = structuredClone(catalog);
const takedownRow = takedownBare.media_assets.find((asset) => asset.id === "m-hades-02");
if (!takedownRow) fail("missing m-hades-02");
takedownRow.moderation_status = "takedown";
takedownRow.takedown_at = null;
takedownRow.takedown_reason = null;
expectFail(takedownBare, "takedown_at", "takedown without audit fields");

const publishedTakedown: Catalog = structuredClone(catalog);
const publishedShot = publishedTakedown.media_assets.find((asset) => asset.id === "m-hades-01");
if (!publishedShot) fail("missing m-hades-01");
publishedShot.moderation_status = "takedown";
publishedShot.takedown_at = "2026-09-19T20:00:00.000Z";
publishedShot.takedown_reason = "test";
expectFail(publishedTakedown, "takedown", "published puzzle cannot keep a takedown asset");

const nsfwPuzzle: Catalog = structuredClone(catalog);
const nsfwGame = nsfwPuzzle.games.find((game) => game.id === "g-hades");
if (!nsfwGame) fail("missing g-hades");
nsfwGame.nsfw_flag = true;
expectFail(nsfwPuzzle, "NSFW", "publishable puzzle cannot use an NSFW-flagged game");

const overlap: Catalog = structuredClone(catalog);
const firstTheme = overlap.themes[0];
if (!firstTheme) fail("seed should include a theme");
overlap.themes.push({
  ...firstTheme,
  id: "t-overlap",
  slug: "overlap-week",
  title: "Overlap Week",
  description:
    "A second unique paragraph written only to fail the overlapping UTC window check between two theme weeks on purpose for tests.",
  start_date: firstTheme.start_date,
  end_date: firstTheme.end_date,
});
expectFail(overlap, "overlaps", "overlapping theme UTC windows");

const dupeDesc: Catalog = structuredClone(catalog);
const seedTheme = dupeDesc.themes[0];
if (!seedTheme) fail("seed should include a theme");
dupeDesc.themes.push({
  ...seedTheme,
  id: "t-dupe-desc",
  slug: "dupe-desc-week",
  title: "Dupe Desc Week",
  description: seedTheme.description,
  start_date: "2025-01-06",
  end_date: "2025-01-12",
});
expectFail(dupeDesc, "duplicate theme description", "duplicate theme description");

const LAUNCH_START = "2026-09-18";
const LAUNCH_DAYS = 60;
function shiftUtc(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, (day ?? 1) + days));
  return date.toISOString().slice(0, 10);
}

const launchDates = Array.from({ length: LAUNCH_DAYS }, (_, index) =>
  shiftUtc(LAUNCH_START, index),
);
if (launchDates[LAUNCH_DAYS - 1] !== "2026-11-16") {
  fail("launch window ends 2026-11-16");
}

const byDate = new Map(catalog.daily_puzzles.map((puzzle) => [puzzle.puzzle_date, puzzle]));
for (const date of launchDates) {
  const puzzle = byDate.get(date);
  if (!puzzle) fail(`missing launch puzzle ${date}`);
  if (puzzle.status !== "published" && puzzle.status !== "scheduled") {
    fail(`${date} must be published or scheduled, got ${puzzle.status}`);
  }
  if (puzzle.asset_ids.length < 1 || puzzle.asset_ids.length > 6) {
    fail(`${date} must have 1-6 shots`);
  }
}
console.log("ok — 60 consecutive UTC days from 2026-09-18");

const launchThemes = [
  { id: "t-autumn-showcase", start: "2026-09-15", end: "2026-09-21" },
  { id: "t-hearth-harvest", start: "2026-09-22", end: "2026-10-06" },
  { id: "t-labyrinth-logic", start: "2026-10-07", end: "2026-10-21" },
  { id: "t-far-roads", start: "2026-10-22", end: "2026-11-16" },
];
for (const expected of launchThemes) {
  const theme = catalog.themes.find((row) => row.id === expected.id);
  if (!theme) fail(`missing launch theme ${expected.id}`);
  if (theme.start_date !== expected.start || theme.end_date !== expected.end) {
    fail(`${expected.id} window mismatch`);
  }
  if (theme.description.length < 80) fail(`${expected.id} description too short`);
}
for (const date of launchDates) {
  const covering = catalog.themes.filter(
    (theme) => theme.start_date <= date && date <= theme.end_date,
  );
  if (covering.length !== 1) {
    fail(`${date} must sit in exactly one theme window, got ${covering.length}`);
  }
}
const launchMonetize = catalog.daily_puzzles
  .filter((puzzle) => launchDates.includes(puzzle.puzzle_date))
  .flatMap((puzzle) => puzzle.asset_ids)
  .map((id) => catalog.media_assets.find((asset) => asset.id === id))
  .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));
if (launchMonetize.some((asset) => asset.can_monetize)) {
  fail("launch-window placeholders must keep can_monetize false until a real press-kit grant");
}
if (
  launchMonetize.some(
    (asset) => asset.rights_status !== "self_shot" && asset.rights_status !== "press_kit" && asset.rights_status !== "licensed",
  )
) {
  fail("launch-window shots must have known rights");
}
console.log("ok — four launch themes cover the 60-day UTC window");

const EXT_START = "2026-11-17";
const EXT_END = "2027-01-15";
const extensionDates = [];
for (let cursor = EXT_START; cursor <= EXT_END; cursor = shiftUtc(cursor, 1)) {
  extensionDates.push(cursor);
}
if (extensionDates.length < 60) fail(`extension shorter than 60 days (${extensionDates.length})`);
if (extensionDates[0] !== EXT_START || extensionDates.at(-1) !== EXT_END) {
  fail("extension bounds drifted");
}

const gamesById = new Map(catalog.games.map((game) => [game.id, game]));
const extDiff = { easy: 0, med: 0, hard: 0 };
const extYears = [];
const extPlatforms = new Set();
for (const date of extensionDates) {
  const puzzle = byDate.get(date);
  if (!puzzle) fail(`missing extension puzzle ${date}`);
  if (puzzle.status !== "published" && puzzle.status !== "scheduled") {
    fail(`${date} must be published or scheduled, got ${puzzle.status}`);
  }
  if (!getPlayableDaily(catalog, date)) {
    fail(`${date} does not resolve through getPlayableDaily (/api/daily)`);
  }
  const game = gamesById.get(puzzle.game_id);
  if (!game) fail(`${date} missing game ${puzzle.game_id}`);
  if (game.aliases.en.length === 0 || game.aliases.zh.length === 0 || game.aliases.ja.length === 0) {
    fail(`${game.id} needs EN, ZH, and JA aliases`);
  }
  extDiff[puzzle.difficulty] += 1;
  extYears.push(game.release_year);
  for (const platform of game.platforms) extPlatforms.add(platform);
  const covering = catalog.themes.filter(
    (theme) => theme.start_date <= date && date <= theme.end_date,
  );
  if (covering.length !== 1) {
    fail(`${date} must sit in exactly one theme window, got ${covering.length}`);
  }
  if (puzzle.theme_id !== covering[0]?.id) {
    fail(`${date} theme_id ${puzzle.theme_id} does not match ${covering[0]?.id}`);
  }
}

if (extDiff.easy < 20 || extDiff.med < 18 || extDiff.hard < 6) {
  fail(`extension difficulty is unbalanced: ${JSON.stringify(extDiff)}`);
}
if (Math.min(...extYears) > 2012 || Math.max(...extYears) < 2022) {
  fail("extension answers should span early-2010s through 2022+");
}
for (const platform of ["PC", "Nintendo Switch", "PlayStation 4"]) {
  if (!extPlatforms.has(platform)) fail(`extension missing platform ${platform}`);
}

const lastSeen = new Map();
const ordered = [...catalog.daily_puzzles].sort((a, b) =>
  a.puzzle_date < b.puzzle_date ? -1 : 1,
);
for (const puzzle of ordered) {
  const prev = lastSeen.get(puzzle.game_id);
  if (prev) {
    const gap = (() => {
      const [ay, am, ad] = prev.split("-").map(Number);
      const [by, bm, bd] = puzzle.puzzle_date.split("-").map(Number);
      return Math.round(
        (Date.UTC(by, (bm ?? 1) - 1, bd ?? 1) - Date.UTC(ay, (am ?? 1) - 1, ad ?? 1)) /
          86400000,
      );
    })();
    if (gap < 30) {
      fail(`${puzzle.game_id} repeats within 30 days (${prev} -> ${puzzle.puzzle_date}, gap ${gap})`);
    }
  }
  lastSeen.set(puzzle.game_id, puzzle.puzzle_date);
}
console.log(
  `ok — ${extensionDates.length} UTC days ${EXT_START} through ${EXT_END} resolve via getPlayableDaily`,
);

const extensionThemes = [
  { id: "t-lantern-season", slug: "lantern-season", start: "2026-11-17", end: "2026-12-01" },
  { id: "t-glass-routes", slug: "glass-routes", start: "2026-12-02", end: "2026-12-16" },
  { id: "t-hearth-and-holly", slug: "hearth-and-holly", start: "2026-12-17", end: "2026-12-31" },
  { id: "t-year-in-review", slug: "year-in-review", start: "2027-01-01", end: "2027-01-15" },
];
for (const expected of extensionThemes) {
  const theme = catalog.themes.find((row) => row.id === expected.id);
  if (!theme) fail(`missing extension theme ${expected.id}`);
  if (theme.slug !== expected.slug) fail(`${expected.id} slug mismatch`);
  if (theme.start_date !== expected.start || theme.end_date !== expected.end) {
    fail(`${expected.id} window mismatch`);
  }
  if (theme.description.length < 80) fail(`${expected.id} description too short`);
}
console.log("ok — four extension themes cover 2026-11-17 through 2027-01-15");

function listSvgFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listSvgFiles(full));
    else if (entry.name.endsWith(".svg")) out.push(full);
  }
  return out;
}

const rawAmp = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/;
for (const file of listSvgFiles(join(process.cwd(), "public/media"))) {
  const text = readFileSync(file, "utf8");
  if (rawAmp.test(text)) {
    fail(`unescaped & in ${file} (SVG will not parse in <img>)`);
  }
}
console.log("ok — self-hosted SVGs have no raw ampersands");

console.log("All catalog validation tests passed.");
