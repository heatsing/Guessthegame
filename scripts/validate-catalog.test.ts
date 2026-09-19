import { readSeedCatalog } from "../lib/catalog/load";
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

console.log("All catalog validation tests passed.");
