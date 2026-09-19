# Catalog validation

`npm run validate` loads `data/seed/*.json` and exits non-zero when the catalog is unsafe to ship.

Checks:

1. Zod schemas for `games`, `game_sources`, `media_assets`, `daily_puzzles`, `themes`
2. Steam CDN hosts on `media_assets.storage_url` and `themes.hero_image`
3. `unknown` rights marked `can_monetize` or `moderation_status: approved`
4. Scheduled/published puzzles referencing missing, unapproved, or unknown-rights assets
5. Duplicate ids / slugs / puzzle dates, and broken foreign keys
6. Local `public/media/…` files exist and match `checksum`

Types live in `lib/catalog/` (`schema.ts`, `validate.ts`). Gameplay UI is unchanged; import `@/lib/catalog` when a later issue needs to load a day.
