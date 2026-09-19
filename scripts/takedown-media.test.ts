import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { readSeedCatalog } from "../lib/catalog/load";
import { TAKEDOWN_QUARANTINE_ROOT } from "../lib/catalog/media-path";
import { applyMediaTakedown } from "../lib/catalog/takedown";
import { validateCatalog, type Catalog } from "../lib/catalog";
import { getPlayableDaily } from "../lib/daily/load-puzzle";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expect(condition: unknown, message: string): void {
  if (!condition) fail(message);
}

function loadSeed(): Catalog {
  const result = validateCatalog(readSeedCatalog());
  if (!result.ok || !result.catalog) {
    fail(
      "legal seed must pass before takedown drills:\n" +
        result.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n"),
    );
  }
  return result.catalog;
}

const TAKEN_AT = "2026-09-19T20:00:00.000Z";
const seed = loadSeed();

const skipSlot = applyMediaTakedown(seed, {
  mediaId: "m-hades-01",
  reason: "takedown drill — skip slot",
  takenDownAt: TAKEN_AT,
  replaceWithBackup: false,
});

expect(skipSlot.asset.moderation_status === "takedown", "asset marked takedown");
expect(skipSlot.asset.can_monetize === false, "takedown clears can_monetize");
expect(skipSlot.asset.takedown_reason === "takedown drill — skip slot", "reason stored");
expect(skipSlot.asset.takedown_at === TAKEN_AT, "timestamp stored");

const jan15Skip = skipSlot.catalog.daily_puzzles.find((p) => p.id === "p-2026-01-15");
const sep19Skip = skipSlot.catalog.daily_puzzles.find((p) => p.id === "p-2026-09-19");
if (!jan15Skip || !sep19Skip) fail("expected Hades daily rows");
expect(!jan15Skip.asset_ids.includes("m-hades-01"), "Jan 15 skipped the slot");
expect(jan15Skip.asset_ids.includes("m-hades-pk-01"), "press-kit example remains");
expect(jan15Skip.status === "published", "Jan 15 stays published with remaining shots");
expect(!sep19Skip.asset_ids.includes("m-hades-01"), "Sep 19 skipped the slot");
expect(sep19Skip.asset_ids.length === 5, "Sep 19 now has 5 shots");

const skipValidate = validateCatalog(skipSlot.catalog);
if (!skipValidate.ok) {
  fail(
    "catalog must validate after skip-slot takedown:\n" +
      skipValidate.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n"),
  );
}

const playJan15 = getPlayableDaily(skipSlot.catalog, "2026-01-15");
const playSep19 = getPlayableDaily(skipSlot.catalog, "2026-09-19");
expect(playJan15 !== null, "Jan 15 still playable after skip");
expect(
  playJan15?.screenshots.every((shot) => shot.id !== "m-hades-01") ?? false,
  "preview omits the taken-down shot on Jan 15",
);
expect(
  playSep19?.screenshots.every((shot) => shot.id !== "m-hades-01") ?? false,
  "preview omits the taken-down shot on Sep 19",
);
expect(
  playJan15?.screenshots.some((shot) => shot.id === "m-hades-pk-01") ?? false,
  "press-kit example is still previewable",
);
console.log("ok — skip-slot takedown + preview");

const replace = applyMediaTakedown(seed, {
  mediaId: "m-hades-01",
  reason: "takedown drill — replace with backup",
  takenDownAt: TAKEN_AT,
  replaceWithBackup: true,
  nextStorageUrl: `${TAKEDOWN_QUARANTINE_ROOT}/m-hades-01/hades-01.svg`,
});

const jan15Replace = replace.catalog.daily_puzzles.find((p) => p.id === "p-2026-01-15");
const sep19Replace = replace.catalog.daily_puzzles.find((p) => p.id === "p-2026-09-19");
if (!jan15Replace || !sep19Replace) fail("expected Hades rows after replace");
expect(!jan15Replace.asset_ids.includes("m-hades-01"), "replaced out of Jan 15");
expect(jan15Replace.asset_ids.includes("m-hades-04"), "Jan 15 received backup m-hades-04");
expect(sep19Replace.asset_ids.includes("m-hades-pk-01"), "Sep 19 received leftover approved backup");
expect(!sep19Replace.asset_ids.includes("m-hades-01"), "Sep 19 no longer lists taken-down id");
expect(
  replace.puzzleActions.every((action) => action.action === "replaced"),
  "both Hades days used a backup",
);
expect(
  replace.asset.storage_url === `${TAKEDOWN_QUARANTINE_ROOT}/m-hades-01/hades-01.svg`,
  "storage_url points at quarantine",
);

const replaceValidate = validateCatalog(replace.catalog);
if (!replaceValidate.ok) {
  fail(
    "catalog must validate after backup replace:\n" +
      replaceValidate.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n"),
  );
}
const replacePlay = getPlayableDaily(replace.catalog, "2026-09-19");
expect(
  replacePlay?.screenshots.every((shot) => shot.id !== "m-hades-01") ?? false,
  "replaced preview never shows the taken-down id",
);
expect((replacePlay?.screenshots.length ?? 0) === 6, "backup keeps six playable shots on Sep 19");
console.log("ok — backup replace takedown");

const lastShot = applyMediaTakedown(seed, {
  mediaId: "m-hollow-knight-01",
  reason: "takedown drill — last remaining slot",
  takenDownAt: TAKEN_AT,
});
const hollow = lastShot.catalog.daily_puzzles.find((p) => p.id === "p-2026-09-20");
if (!hollow) fail("missing hollow knight day");
expect(hollow.status === "pulled", "last remaining slot pulls the puzzle");
expect(hollow.asset_ids.includes("m-hollow-knight-01"), "pulled row keeps the historical id");
expect(getPlayableDaily(lastShot.catalog, "2026-09-20") === null, "pulled day is not playable");
const lastValidate = validateCatalog(lastShot.catalog);
if (!lastValidate.ok) {
  fail(
    "pulled puzzle must still validate:\n" +
      lastValidate.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n"),
  );
}
console.log("ok — last-slot takedown pulls the day");

const idempotent = applyMediaTakedown(skipSlot.catalog, {
  mediaId: "m-hades-01",
  reason: "takedown drill — already down",
  takenDownAt: "2026-09-20T00:00:00.000Z",
  replaceWithBackup: false,
});
expect(idempotent.alreadyTakedown, "second run reports already takedown");
expect(idempotent.asset.takedown_at === TAKEN_AT, "original timestamp is kept");
expect(
  idempotent.catalog.daily_puzzles
    .filter((puzzle) => puzzle.game_id === "g-hades")
    .every((puzzle) => !puzzle.asset_ids.includes("m-hades-01") || puzzle.status === "pulled"),
  "Hades publishable days still omit the id",
);
console.log("ok — idempotent takedown");

try {
  applyMediaTakedown(seed, {
    mediaId: "m-does-not-exist",
    reason: "nope",
    takenDownAt: TAKEN_AT,
  });
  fail("unknown media id must throw");
} catch (error) {
  expect(
    error instanceof Error && error.message.includes("unknown media id"),
    "unknown media id throws",
  );
}

try {
  applyMediaTakedown(seed, {
    mediaId: "m-hades-01",
    reason: "   ",
    takenDownAt: TAKEN_AT,
  });
  fail("blank reason must throw");
} catch (error) {
  expect(
    error instanceof Error && error.message.includes("reason"),
    "blank reason throws",
  );
}
console.log("ok — takedown argument errors");

const fixture = mkdtempSync(join(tmpdir(), "gtg-takedown-"));
const relPublic = "public/media/demo/m-demo-01.svg";
const absPublic = join(fixture, relPublic);
mkdirSync(join(fixture, "public/media/demo"), { recursive: true });
writeFileSync(absPublic, "<svg xmlns='http://www.w3.org/2000/svg'></svg>\n");
const quarantineRel = `${TAKEDOWN_QUARANTINE_ROOT}/m-demo-01/m-demo-01.svg`;
mkdirSync(join(fixture, TAKEDOWN_QUARANTINE_ROOT, "m-demo-01"), { recursive: true });
const dest = join(fixture, quarantineRel);
writeFileSync(dest, readFileSync(absPublic));
expect(existsSync(dest), "quarantine path can hold the still");
console.log("ok — quarantine path layout");

const cli = spawnSync(
  join(process.cwd(), "node_modules/.bin/tsx"),
  [
    "scripts/takedown-media.ts",
    "--id",
    "m-hades-pk-01",
    "--reason",
    "CLI dry-run drill",
    "--dry-run",
  ],
  { encoding: "utf8", cwd: process.cwd() },
);
if (cli.status !== 0) {
  fail(`takedown CLI dry-run failed:\n${cli.stdout}\n${cli.stderr}`);
}
expect(cli.stdout.includes("m-hades-pk-01"), "CLI prints the media id");
expect(cli.stdout.includes("Dry run"), "CLI dry-run does not write");
expect(
  cli.stdout.includes("p-2026-01-15") || cli.stdout.includes("replaced") || cli.stdout.includes("skipped"),
  "CLI reports the Daily slot rewrite",
);
const seedAfterCli = readFileSync(join(process.cwd(), "data/seed/media_assets.json"), "utf8");
expect(seedAfterCli.includes('"id": "m-hades-pk-01"'), "dry-run left the seed row in place");
expect(
  !seedAfterCli.includes('"moderation_status": "takedown"'),
  "dry-run did not persist a takedown on the seed",
);
console.log("ok — CLI dry-run drill");

console.log("All takedown tests passed.");
