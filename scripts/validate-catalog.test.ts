import { readSeedCatalog } from "../lib/catalog/load";
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

console.log("All catalog validation tests passed.");
