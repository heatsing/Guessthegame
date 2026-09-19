import type { Catalog, DailyPuzzle, MediaAsset } from "./schema";
import { isSteamCdnUrl } from "./steam";

function isBackupCandidate(asset: MediaAsset): boolean {
  return (
    asset.moderation_status === "approved" &&
    asset.rights_status !== "unknown" &&
    !isSteamCdnUrl(asset.storage_url)
  );
}

export type MediaTakedownOptions = {
  mediaId: string;
  reason: string;
  takenDownAt: string;
  /** When true (default), fill the removed slot with another approved shot. */
  replaceWithBackup?: boolean;
  /** Optional non-public path after the file is quarantined. */
  nextStorageUrl?: string;
};

export type PuzzleTakedownAction = {
  puzzleId: string;
  puzzleDate: string;
  action: "replaced" | "skipped" | "pulled";
  removedAssetId: string;
  backupAssetId: string | null;
  remainingAssetIds: string[];
};

export type MediaTakedownResult = {
  catalog: Catalog;
  mediaId: string;
  alreadyTakedown: boolean;
  asset: MediaAsset;
  puzzleActions: PuzzleTakedownAction[];
};

function pickBackup(
  catalog: Catalog,
  gameId: string,
  usedIds: ReadonlySet<string>,
): MediaAsset | undefined {
  return catalog.media_assets.find(
    (asset) =>
      asset.game_id === gameId &&
      !usedIds.has(asset.id) &&
      isBackupCandidate(asset),
  );
}

function rewritePuzzle(
  puzzle: DailyPuzzle,
  mediaId: string,
  backup: MediaAsset | undefined,
): { puzzle: DailyPuzzle; action: PuzzleTakedownAction } | null {
  const index = puzzle.asset_ids.indexOf(mediaId);
  if (index === -1) return null;

  const nextIds = [...puzzle.asset_ids];

  if (backup) {
    nextIds[index] = backup.id;
    return {
      puzzle: { ...puzzle, asset_ids: nextIds },
      action: {
        puzzleId: puzzle.id,
        puzzleDate: puzzle.puzzle_date,
        action: "replaced",
        removedAssetId: mediaId,
        backupAssetId: backup.id,
        remainingAssetIds: nextIds,
      },
    };
  }

  nextIds.splice(index, 1);

  if (nextIds.length === 0) {
    const kept = [mediaId];
    return {
      puzzle: { ...puzzle, asset_ids: kept, status: "pulled" },
      action: {
        puzzleId: puzzle.id,
        puzzleDate: puzzle.puzzle_date,
        action: "pulled",
        removedAssetId: mediaId,
        backupAssetId: null,
        remainingAssetIds: kept,
      },
    };
  }

  return {
    puzzle: { ...puzzle, asset_ids: nextIds },
    action: {
      puzzleId: puzzle.id,
      puzzleDate: puzzle.puzzle_date,
      action: "skipped",
      removedAssetId: mediaId,
      backupAssetId: null,
      remainingAssetIds: nextIds,
    },
  };
}

/**
 * Mark one media row as takedown and rewrite Daily slots that referenced it.
 * Pure catalog transform — the CLI moves the public file separately.
 */
export function applyMediaTakedown(
  input: Catalog,
  options: MediaTakedownOptions,
): MediaTakedownResult {
  const reason = options.reason.trim();
  if (!reason) {
    throw new Error("takedown reason is required");
  }

  const catalog = structuredClone(input);
  const asset = catalog.media_assets.find((row) => row.id === options.mediaId);
  if (!asset) {
    throw new Error(`unknown media id "${options.mediaId}"`);
  }

  const alreadyTakedown = asset.moderation_status === "takedown";
  asset.moderation_status = "takedown";
  asset.can_monetize = false;
  asset.takedown_reason = reason;
  if (!alreadyTakedown || !asset.takedown_at) {
    asset.takedown_at = options.takenDownAt;
  }
  if (options.nextStorageUrl) {
    asset.storage_url = options.nextStorageUrl;
  }

  const replaceWithBackup = options.replaceWithBackup !== false;
  const puzzleActions: PuzzleTakedownAction[] = [];

  catalog.daily_puzzles = catalog.daily_puzzles.map((puzzle) => {
    if (!puzzle.asset_ids.includes(options.mediaId)) return puzzle;

    const used = new Set(puzzle.asset_ids.filter((id) => id !== options.mediaId));
    const backup = replaceWithBackup
      ? pickBackup(catalog, puzzle.game_id, used)
      : undefined;
    const rewritten = rewritePuzzle(puzzle, options.mediaId, backup);
    if (!rewritten) return puzzle;
    puzzleActions.push(rewritten.action);
    return rewritten.puzzle;
  });

  return {
    catalog,
    mediaId: options.mediaId,
    alreadyTakedown,
    asset,
    puzzleActions,
  };
}
