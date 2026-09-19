# Catalog validation

`npm run validate` loads `data/seed/*.json` and exits non-zero when the catalog is unsafe to ship.

Checks:

1. Zod schemas for `games`, `game_sources`, `media_assets`, `daily_puzzles`, `themes`
2. Steam CDN hosts on `media_assets.storage_url` and `themes.hero_image` (approved + Steam CDN is forbidden)
3. `unknown` rights marked `can_monetize` or `moderation_status: approved`
4. Known-rights rows missing `licensor` / `license_doc_url` / `attribution_text`
5. `storage_url` naming: `/media/placeholders/…` or `/media/{game-slug}/{asset-id}.{ext}` (same path on a non-Steam object-storage origin is allowed)
6. Scheduled/published puzzles referencing missing, unapproved, or unknown-rights assets
7. Duplicate ids / slugs / puzzle dates, and broken foreign keys
8. Theme weeks: unique descriptions (min 80 chars), inclusive UTC windows that do not overlap
9. Local `public/media/…` files exist and match `checksum` (takedown rows skipped)
10. Repo-relative `license_doc_url` files exist under `data/licenses/` (or `docs/`)

Takedown is `npm run takedown` ([media-pipeline.md](media-pipeline.md)). After a takedown, this validator must pass and Daily preview must omit the image.

Types live in `lib/catalog/` (`schema.ts`, `validate.ts`, `media-path.ts`, `takedown.ts`). Theme windows and spoiler-free theme pages live in `lib/themes.ts`. The homepage loads a day through `@/lib/catalog` (`loadBundledCatalog`) and `@/lib/daily`.
