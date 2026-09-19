import dailyPuzzles from "../../data/seed/daily_puzzles.json";
import gameSources from "../../data/seed/game_sources.json";
import games from "../../data/seed/games.json";
import mediaAssets from "../../data/seed/media_assets.json";
import themes from "../../data/seed/themes.json";

import { CatalogSchema, type Catalog } from "./schema";

/**
 * Catalog for the Next.js runtime. Static JSON imports are bundled with the
 * serverless function (unlike `fs` reads in `./load`, which are script-only).
 */
export function loadBundledCatalog(): Catalog {
  return CatalogSchema.parse({
    games,
    game_sources: gameSources,
    media_assets: mediaAssets,
    daily_puzzles: dailyPuzzles,
    themes,
  });
}
