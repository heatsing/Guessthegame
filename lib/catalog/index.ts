export {
  AssetTypeSchema,
  CatalogSchema,
  DailyPuzzleSchema,
  flattenAliases,
  GameSchema,
  GameSourceSchema,
  GameStatusSchema,
  IsoDateSchema,
  IsoDateTimeSchema,
  LocaleAliasesSchema,
  LocaleCodeSchema,
  MediaAssetSchema,
  ModerationStatusSchema,
  PuzzleDifficultySchema,
  PuzzleHintSchema,
  PuzzleStatusSchema,
  RightsStatusSchema,
  SourceSystemSchema,
  ThemeSchema,
  type AssetType,
  type Catalog,
  type DailyPuzzle,
  type Game,
  type GameSource,
  type GameStatus,
  type LocaleAliases,
  type LocaleCode,
  type MediaAsset,
  type ModerationStatus,
  type PuzzleDifficulty,
  type PuzzleHint,
  type PuzzleStatus,
  type RightsStatus,
  type SourceSystem,
  type Theme,
} from "./schema";

export { isSteamCdnUrl, STEAM_CDN_HOST_SUFFIXES } from "./steam";

/** Disk loaders (`./load`) are Node/script only — they use `fs`. */

export {
  formatIssues,
  validateCatalog,
  type CatalogIssue,
  type CatalogValidationResult,
} from "./validate";
