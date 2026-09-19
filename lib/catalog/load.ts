import { readFileSync } from "node:fs";
import { join } from "node:path";

import { CatalogSchema, type Catalog } from "./schema";
import { validateCatalog, type CatalogValidationResult } from "./validate";

export const SEED_DIR = "data/seed";

type SeedKey =
  | "games"
  | "game_sources"
  | "media_assets"
  | "daily_puzzles"
  | "themes";

function readJsonFile(dir: string, name: SeedKey): unknown {
  const raw = readFileSync(join(dir, `${name}.json`), "utf8");
  return JSON.parse(raw) as unknown;
}

/** Read seed JSON from disk (repo-root-relative `data/seed` by default). */
export function readSeedCatalog(seedDir = SEED_DIR): unknown {
  return {
    games: readJsonFile(seedDir, "games"),
    game_sources: readJsonFile(seedDir, "game_sources"),
    media_assets: readJsonFile(seedDir, "media_assets"),
    daily_puzzles: readJsonFile(seedDir, "daily_puzzles"),
    themes: readJsonFile(seedDir, "themes"),
  };
}

export function parseCatalog(input: unknown): Catalog {
  return CatalogSchema.parse(input);
}

export function loadCatalog(seedDir = SEED_DIR): Catalog {
  return parseCatalog(readSeedCatalog(seedDir));
}

export function loadAndValidateCatalog(
  seedDir = SEED_DIR,
): CatalogValidationResult {
  return validateCatalog(readSeedCatalog(seedDir));
}
