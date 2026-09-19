import { z } from "zod";

/** ISO calendar date (UTC day boundary for daily puzzles). */
export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const IsoDateTimeSchema = z.string().datetime({ offset: true });

export const IdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9_-]*$/, "ids must be lowercase slug-like tokens");

export const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "expected lowercase kebab-case");

export const LocaleCodeSchema = z.enum(["en", "zh", "ja"]);

/**
 * Localized aliases used for guess matching (title OR any alias).
 * Keys for EN / ZH / JA are required; arrays may be empty if unknown.
 */
export const LocaleAliasesSchema = z
  .object({
    en: z.array(z.string().min(1)),
    zh: z.array(z.string().min(1)),
    ja: z.array(z.string().min(1)),
  })
  .strict();

export const GameStatusSchema = z.enum(["active", "hidden"]);

export const GameSchema = z
  .object({
    id: IdSchema,
    slug: SlugSchema,
    title: z.string().min(1),
    aliases: LocaleAliasesSchema,
    release_year: z.number().int().min(1950).max(2100),
    platforms: z.array(z.string().min(1)).min(1),
    genres: z.array(z.string().min(1)).min(1),
    developer: z.string().min(1).nullable(),
    publisher: z.string().min(1).nullable(),
    steam_app_id: z.number().int().positive().nullable(),
    wikidata_qid: z
      .string()
      .regex(/^Q\d+$/, "expected Wikidata QID like Q123")
      .nullable(),
    rawg_id: z.number().int().positive().nullable(),
    igdb_id: z.number().int().positive().nullable(),
    age_rating: z.string().min(1).nullable(),
    nsfw_flag: z.boolean(),
    status: GameStatusSchema,
    created_at: IsoDateTimeSchema,
    updated_at: IsoDateTimeSchema,
  })
  .strict();

export const SourceSystemSchema = z.enum([
  "wikidata",
  "rawg",
  "igdb",
  "steam",
  "press_kit",
  "manual",
]);

export const GameSourceSchema = z
  .object({
    id: IdSchema,
    game_id: IdSchema,
    source_system: SourceSystemSchema,
    source_id: z.string().min(1),
    source_url: z.string().min(1),
    raw_payload_ref: z.string().min(1).nullable(),
    fetched_at: IsoDateTimeSchema,
    license_note: z.string().min(1),
  })
  .strict();

export const AssetTypeSchema = z.enum(["screenshot", "cover"]);

export const RightsStatusSchema = z.enum([
  "press_kit",
  "self_shot",
  "licensed",
  "unknown",
]);

export const ModerationStatusSchema = z.enum([
  "approved",
  "rejected",
  "takedown",
]);

export const MediaAssetSchema = z
  .object({
    id: IdSchema,
    game_id: IdSchema,
    asset_type: AssetTypeSchema,
    storage_url: z.string().min(1),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    checksum: z
      .string()
      .regex(/^[a-f0-9]{64}$/, "expected lowercase sha256 hex"),
    rights_status: RightsStatusSchema,
    licensor: z.string(),
    license_doc_url: z.string(),
    attribution_text: z.string(),
    can_monetize: z.boolean(),
    moderation_status: ModerationStatusSchema,
    takedown_at: IsoDateTimeSchema.nullable(),
    takedown_reason: z.string().nullable(),
  })
  .strict();

export const PuzzleDifficultySchema = z.enum(["easy", "med", "hard"]);

export const PuzzleStatusSchema = z.enum(["scheduled", "published", "pulled"]);

export const PuzzleHintSchema = z
  .object({
    after_wrong_guesses: z.number().int().min(3).max(5),
    text: z.string().min(1),
  })
  .strict();

export const DailyPuzzleSchema = z
  .object({
    id: IdSchema,
    puzzle_date: IsoDateSchema,
    game_id: IdSchema,
    asset_ids: z.array(IdSchema).min(1).max(6),
    theme_id: IdSchema.nullable(),
    difficulty: PuzzleDifficultySchema,
    hints: z.array(PuzzleHintSchema).max(2),
    status: PuzzleStatusSchema,
  })
  .strict();

export const ThemeSchema = z
  .object({
    id: IdSchema,
    slug: SlugSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    start_date: IsoDateSchema,
    end_date: IsoDateSchema,
    hero_image: z.string().min(1),
  })
  .strict();

export const CatalogSchema = z
  .object({
    games: z.array(GameSchema),
    game_sources: z.array(GameSourceSchema),
    media_assets: z.array(MediaAssetSchema),
    daily_puzzles: z.array(DailyPuzzleSchema),
    themes: z.array(ThemeSchema),
  })
  .strict();

export type LocaleCode = z.infer<typeof LocaleCodeSchema>;
export type LocaleAliases = z.infer<typeof LocaleAliasesSchema>;
export type GameStatus = z.infer<typeof GameStatusSchema>;
export type Game = z.infer<typeof GameSchema>;
export type SourceSystem = z.infer<typeof SourceSystemSchema>;
export type GameSource = z.infer<typeof GameSourceSchema>;
export type AssetType = z.infer<typeof AssetTypeSchema>;
export type RightsStatus = z.infer<typeof RightsStatusSchema>;
export type ModerationStatus = z.infer<typeof ModerationStatusSchema>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
export type PuzzleDifficulty = z.infer<typeof PuzzleDifficultySchema>;
export type PuzzleStatus = z.infer<typeof PuzzleStatusSchema>;
export type PuzzleHint = z.infer<typeof PuzzleHintSchema>;
export type DailyPuzzle = z.infer<typeof DailyPuzzleSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;

/** Flatten EN/ZH/JA aliases for guess matching. */
export function flattenAliases(aliases: LocaleAliases): string[] {
  return [...aliases.en, ...aliases.zh, ...aliases.ja];
}
