import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

import { loadAndValidateCatalog, SEED_DIR } from "../lib/catalog/load";
import {
  validateLicenseArchives,
  validateLocalMediaFiles,
} from "../lib/catalog/local-media";
import { TAKEDOWN_QUARANTINE_ROOT } from "../lib/catalog/media-path";
import { applyMediaTakedown } from "../lib/catalog/takedown";
import { formatIssues } from "../lib/catalog/validate";

type CliOptions = {
  mediaId: string;
  reason: string;
  dryRun: boolean;
  replaceWithBackup: boolean;
  takenDownAt: string;
};

function usage(): never {
  console.error(`Usage:
  npm run takedown -- --id <media_id> --reason "<why>" [--dry-run] [--no-backup]

Marks the media row takedown, quarantines the public file under ${TAKEDOWN_QUARANTINE_ROOT}/,
and rewrites Daily slots (replace with an approved backup, or skip the slot).
If no approved shot remains, the puzzle is pulled.

Production invisibility depends on a production deploy (usually a few minutes
after merge to main). See docs/media-pipeline.md.`);
  process.exit(2);
}

function parseArgs(argv: string[]): CliOptions {
  let mediaId = "";
  let reason = "";
  let dryRun = false;
  let replaceWithBackup = true;
  let takenDownAt = new Date().toISOString();

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--id" || arg === "--media-id") {
      mediaId = argv[++i] ?? "";
    } else if (arg === "--reason") {
      reason = argv[++i] ?? "";
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--no-backup") {
      replaceWithBackup = false;
    } else if (arg === "--at") {
      takenDownAt = argv[++i] ?? takenDownAt;
    } else if (arg === "--help" || arg === "-h") {
      usage();
    } else {
      console.error(`Unknown argument: ${arg}`);
      usage();
    }
  }

  if (!mediaId.trim() || !reason.trim()) usage();

  return {
    mediaId: mediaId.trim(),
    reason: reason.trim(),
    dryRun,
    replaceWithBackup,
    takenDownAt,
  };
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function publicFileForStorageUrl(
  storageUrl: string,
  repoRoot: string,
): string | null {
  if (!storageUrl.startsWith("/media/")) return null;
  return join(repoRoot, "public", storageUrl.replace(/^\//, ""));
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const loaded = loadAndValidateCatalog();
  if (!loaded.ok || !loaded.catalog) {
    console.error("Catalog is already invalid:\n" + formatIssues(loaded.issues));
    process.exit(1);
  }

  const current = loaded.catalog.media_assets.find(
    (asset) => asset.id === options.mediaId,
  );
  if (!current) {
    console.error(`Unknown media id "${options.mediaId}".`);
    process.exit(1);
  }

  const publicFile = publicFileForStorageUrl(current.storage_url, repoRoot);
  const quarantineRel = publicFile
    ? `${TAKEDOWN_QUARANTINE_ROOT}/${options.mediaId}/${basename(publicFile)}`
    : undefined;

  const result = applyMediaTakedown(loaded.catalog, {
    mediaId: options.mediaId,
    reason: options.reason,
    takenDownAt: options.takenDownAt,
    replaceWithBackup: options.replaceWithBackup,
    nextStorageUrl: quarantineRel,
  });

  console.log(
    result.alreadyTakedown
      ? `Media ${options.mediaId} was already takedown; puzzles rechecked.`
      : `Media ${options.mediaId} marked takedown.`,
  );
  if (result.puzzleActions.length === 0) {
    console.log("No daily puzzles referenced this asset.");
  }
  for (const action of result.puzzleActions) {
    if (action.action === "replaced") {
      console.log(
        `  ${action.puzzleId} (${action.puzzleDate}): replaced slot with ${action.backupAssetId}`,
      );
    } else if (action.action === "skipped") {
      console.log(
        `  ${action.puzzleId} (${action.puzzleDate}): skipped slot; remaining ${action.remainingAssetIds.join(", ")}`,
      );
    } else {
      console.log(
        `  ${action.puzzleId} (${action.puzzleDate}): pulled (no approved slot left)`,
      );
    }
  }

  if (publicFile && existsSync(publicFile)) {
    console.log(
      options.dryRun
        ? `Would quarantine ${publicFile} → ${quarantineRel}`
        : `Quarantine ${publicFile} → ${quarantineRel}`,
    );
  } else if (publicFile) {
    console.log(`Public file already absent: ${publicFile}`);
  }

  if (options.dryRun) {
    console.log("Dry run — catalog JSON was not written.");
    process.exit(0);
  }

  if (publicFile && existsSync(publicFile) && quarantineRel) {
    const dest = join(repoRoot, quarantineRel);
    mkdirSync(dirname(dest), { recursive: true });
    renameSync(publicFile, dest);
  }

  writeJson(join(repoRoot, SEED_DIR, "media_assets.json"), result.catalog.media_assets);
  writeJson(join(repoRoot, SEED_DIR, "daily_puzzles.json"), result.catalog.daily_puzzles);

  const check = loadAndValidateCatalog();
  if (!check.ok || !check.catalog) {
    console.error(
      "Takedown written but catalog failed validation:\n" +
        formatIssues(check.issues),
    );
    process.exit(1);
  }
  const localIssues = [
    ...validateLocalMediaFiles(check.catalog),
    ...validateLicenseArchives(check.catalog),
  ];
  if (localIssues.length > 0) {
    console.error(
      "Takedown written but local media/license checks failed:\n" +
        formatIssues(localIssues),
    );
    process.exit(1);
  }

  console.log(
    "Catalog rewritten. Commit, push, and deploy so production drops the image (usually a few minutes).",
  );
}

main();
