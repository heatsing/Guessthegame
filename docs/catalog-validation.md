# Catalog validation

`npm run validate` loads `data/seed/*.json` and exits non-zero when the catalog is unsafe to ship.

Checks:

1. Zod schemas for `games`, `game_sources`, `media_assets`, `daily_puzzles`, `themes`
2. Steam CDN hosts on `media_assets.storage_url` and `themes.hero_image`
3. `unknown` rights marked `can_monetize` or `moderation_status: approved`
4. Scheduled/published puzzles referencing missing, unapproved, or unknown-rights assets
5. Duplicate ids / slugs / puzzle dates, and broken foreign keys
6. Theme weeks: unique descriptions (min 80 chars), inclusive UTC windows that do not overlap
7. Local `public/media/…` files exist and match `checksum`

Types live in `lib/catalog/` (`schema.ts`, `validate.ts`). Theme windows and spoiler-free theme pages live in `lib/themes.ts`. The homepage loads a day through `@/lib/catalog` (`loadBundledCatalog`) and `@/lib/daily`.
