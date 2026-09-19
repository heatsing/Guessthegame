# How to add a daily puzzle

Catalog data lives in Git as JSON. There is no CMS. Edit the seed files, then run the validator before you open a PR.

UTC midnight is the day boundary. One puzzle per `YYYY-MM-DD`. The homepage (`/` and `/api/daily`) loads that UTC date. `/archive` lists the last 30 already-open published days. `/puzzle/[YYYY-MM-DD]` replays a day with the same play loop; future or unpublished dates 404 even if a seed row exists. Set `DAILY_PUZZLE_DATE` only for local demos.

## 1. Make sure the game exists

If the title is new, append an object to `data/seed/games.json`:

- Required: `id`, `slug`, `title`, `aliases.en` / `aliases.zh` / `aliases.ja`, `release_year`, `platforms`, `genres`, `nsfw_flag`, `status`
- Optional identifiers: `steam_app_id` (store deep link only), `wikidata_qid`, `rawg_id`, `igdb_id`
- Set `status` to `active` for titles that can appear in a puzzle or autocomplete later
- Set `nsfw_flag: true` for adult / sexual content. Daily never schedules those rows (`npm run validate` rejects a `published` / `scheduled` NSFW answer)

Record where the metadata came from in `data/seed/game_sources.json` (`source_system`, `source_id`, `source_url`, `fetched_at`, `license_note`). Wikidata (CC0) is the preferred skeleton.

## 2. Add self-hosted screenshots

Follow [media-pipeline.md](media-pipeline.md). Put 1–6 images under
`public/media/{game-slug}/{asset-id}.{ext}` (never a Steam CDN URL). Seed
placeholders may stay in `public/media/placeholders/`. Append matching rows
to `data/seed/media_assets.json`. Archive the grant at
`data/licenses/{game-slug}/{asset-id}.md`.

Every asset **must** include the rights fields:

| Field | Notes |
| --- | --- |
| `rights_status` | `press_kit` \| `self_shot` \| `licensed` \| `unknown` |
| `licensor` | Who granted the right (empty only when still `unknown`) |
| `license_doc_url` | Written permission / press-kit archive |
| `attribution_text` | On-page credit |
| `can_monetize` | `true` only with a known, ad-safe license |

Also set `moderation_status`. Production rules enforced by the validator:

- `unknown` + `can_monetize: true` → fail
- `unknown` + `moderation_status: approved` → fail (not publishable)
- `approved` + Steam CDN `storage_url` → fail
- `storage_url` or theme `hero_image` pointing at a Steam CDN host → fail
- `storage_url` not under `/media/placeholders/` or `/media/{slug}/{id}.{ext}` → fail

Compute `checksum` as the SHA-256 hex of the file bytes, for example:

```bash
sha256sum public/media/your-game/shot-01.webp
```

## 3. Schedule the day

Append one object to `data/seed/daily_puzzles.json`:

```json
{
  "id": "p-2026-02-01",
  "puzzle_date": "2026-02-01",
  "game_id": "g-hades",
  "asset_ids": ["m-hades-01", "m-hades-02"],
  "theme_id": "t-indie-first-week",
  "difficulty": "med",
  "hints": [{ "after_wrong_guesses": 3, "text": "Optional soft hint." }],
  "status": "scheduled"
}
```

Rules:

- `puzzle_date` is unique
- `asset_ids` is the reveal order (1–6). The first id is the primary shot
- `scheduled` or `published` puzzles may only reference `approved` assets with known rights, and may not use a `nsfw_flag: true` game
- `theme_id` may be `null`. Theme weeks live in `data/seed/themes.json` (`slug`, display `title`, unique `description`, inclusive UTC `start_date` / `end_date`). Only one theme window may cover a given UTC day. The homepage badge and `/themes/[slug]` read that file; they never print the puzzle answer.

Use `pulled` if a day has to come down (DMCA / mistake). Do not reuse that date for a different answer without an explicit ops decision.

## 4. Validate

```bash
npm run validate
```

The script exits **0** only when the schema, rights rules, Steam CDN ban, referential integrity, and local `/media/` checksums all pass. It exits **non-zero** on the first failing catalog.

`npm test` re-runs the legal seed and asserts that a Steam CDN URL or `unknown` publishable/monetizable asset is rejected. It also runs the takedown drill (`scripts/takedown-media.test.ts`).

To pull one still after publish:

```bash
npm run takedown -- --id m-example-01 --reason "DMCA notice"
```

## 5. Ship

Commit the JSON, images, and checksum updates together. Do not add a bulk dump API or a CMS UI.

## 6. Launch window (Issue #12)

Documented UTC start: **2026-09-18**. Seed ships **60 consecutive** `published` / `scheduled` days through **2026-11-16**, plus the January sample days (`2026-01-15`, `2026-01-16`).

Four Theme Weeks cover that window (inclusive UTC, no overlaps). Indie First Week stays as a January demo and is not part of the 60-day block.

| Theme | Slug | UTC range |
| --- | --- | --- |
| Autumn Showcase | `autumn-showcase` | 2026-09-15 – 2026-09-21 |
| Hearth & Harvest | `hearth-harvest` | 2026-09-22 – 2026-10-06 |
| Labyrinth Logic | `labyrinth-logic` | 2026-10-07 – 2026-10-21 |
| Far Roads | `far-roads` | 2026-10-22 – 2026-11-16 |

### Launch checklist

- [ ] `npm run validate` exits 0 (schema, rights, Steam CDN ban, local `/media/` checksums, license archives)
- [ ] New titles have EN aliases and a common ZH name where one exists
- [ ] No `nsfw_flag: true` game is `published` / `scheduled`
- [ ] Theme descriptions are unique (≥80 chars) and never name an answer
- [ ] Seed stills under `public/media/placeholders/` are **original first-party SVG/ASCII**, labeled `rights_status: self_shot` and `can_monetize: false`. License note: `data/licenses/seed-placeholders.md`
- [ ] **Before AdSense:** swap every launch-window still for a real press-kit / written-permission file. Do not claim placeholders are licensed press kits.

January `m-hades-pk-01` is a pipeline-demo press-kit path, not a publisher grant.
