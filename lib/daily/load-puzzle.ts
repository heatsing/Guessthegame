import {
  flattenAliases,
  type Catalog,
  type Game,
  type MediaAsset,
} from "@/lib/catalog/schema";
import { isSteamCdnUrl } from "@/lib/catalog/steam";

import { acceptedAnswersForGame } from "./guess";

const PLAYABLE_STATUSES = new Set(["scheduled", "published"]);

export type PlayableScreenshot = {
  id: string;
  src: string;
  width: number;
  height: number;
};

export type DailyAnswer = {
  title: string;
  releaseYear: number;
  platforms: string[];
  storeUrl: string | null;
  storeLabel: string | null;
  accepted: string[];
};

export type PlayableDaily = {
  date: string;
  screenshots: PlayableScreenshot[];
  answer: DailyAnswer;
};

export function storeLinkForGame(
  game: Game,
): { url: string; label: string } | null {
  if (game.steam_app_id) {
    return {
      url: `https://store.steampowered.com/app/${game.steam_app_id}`,
      label: "View on Steam",
    };
  }
  return null;
}

export function isPlayableScreenshot(asset: MediaAsset): boolean {
  return (
    asset.moderation_status === "approved" &&
    asset.rights_status !== "unknown" &&
    !isSteamCdnUrl(asset.storage_url)
  );
}

export function getPlayableDaily(
  catalog: Catalog,
  date: string,
): PlayableDaily | null {
  const puzzle = catalog.daily_puzzles.find(
    (item) => item.puzzle_date === date && PLAYABLE_STATUSES.has(item.status),
  );
  if (!puzzle) return null;

  const game = catalog.games.find(
    (item) => item.id === puzzle.game_id && item.status === "active",
  );
  if (!game) return null;

  const assetsById = new Map(
    catalog.media_assets.map((asset) => [asset.id, asset]),
  );
  const screenshots: PlayableScreenshot[] = [];

  for (const assetId of puzzle.asset_ids) {
    const asset = assetsById.get(assetId);
    if (!asset || !isPlayableScreenshot(asset)) continue;
    screenshots.push({
      id: asset.id,
      src: asset.storage_url,
      width: asset.width,
      height: asset.height,
    });
  }

  if (screenshots.length === 0) return null;

  const store = storeLinkForGame(game);

  return {
    date,
    screenshots,
    answer: {
      title: game.title,
      releaseYear: game.release_year,
      platforms: game.platforms,
      storeUrl: store?.url ?? null,
      storeLabel: store?.label ?? null,
      accepted: acceptedAnswersForGame(game),
    },
  };
}

/** Fields that may appear in no-JS HTML. Must never include the answer. */
export type DailyPublicCopy = {
  date: string;
  hasPuzzle: boolean;
};

export function getDailyPublicCopy(
  catalog: Catalog,
  date: string,
): DailyPublicCopy {
  return {
    date,
    hasPuzzle: getPlayableDaily(catalog, date) !== null,
  };
}

/** Guard for tests: answer strings must not leak into public copy. */
export function publicCopyContainsAnswer(
  copy: DailyPublicCopy,
  accepted: readonly string[],
): boolean {
  const blob = JSON.stringify(copy).toLowerCase();
  return accepted.some((alias) => {
    const needle = alias.trim().toLowerCase();
    return needle.length > 0 && blob.includes(needle);
  });
}

export function aliasListForGame(game: Game): string[] {
  return flattenAliases(game.aliases);
}
