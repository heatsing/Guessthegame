# How to add a daily puzzle

Catalog data lives in Git as JSON. There is no CMS. Edit the seed files, then run the validator before you open a PR.

UTC midnight is the day boundary. One puzzle per `YYYY-MM-DD`. The homepage (`/` and `/api/daily`) loads that UTC date. `/archive` lists the last 30 already-open published days. `/puzzle/[YYYY-MM-DD]` replays a day with the same play loop; future or unpublished dates 404 even if a seed row exists. Set `DAILY_PUZZLE_DATE` only for local demos.

## 1. Make sure the game exists

If the title is new, append an object to `data/seed/games.json`:

- Required: `id`, `slug`, `title`, `aliases.en` / `aliases.zh` / `aliases.ja`, `release_year`, `platforms`, `genres`, `nsfw_flag`, `status`
- Optional identifiers: `steam_app_id` (store deep link only), `wikidata_qid`, `rawg_id`, `igdb_id`
- Set `status` to `active` for titles that can appear in a puzzle or autocomplete later

Record where the metadata came from in `data/seed/game_sources.json` (`source_system`, `source_id`, `source_url`, `fetched_at`, `license_note`). Wikidata (CC0) is the preferred skeleton.

## 2. Add self-hosted screenshots

Put 1–6 images under `public/media/` (never a Steam CDN URL). Append matching rows to `data/seed/media_assets.json`.

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
- `storage_url` or theme `hero_image` pointing at a Steam CDN host → fail

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
- `scheduled` or `published` puzzles may only reference `approved` assets with known rights
- `theme_id` may be `null`. Theme weeks live in `data/seed/themes.json` and do not change the rules

Use `pulled` if a day has to come down (DMCA / mistake). Do not reuse that date for a different answer without an explicit ops decision.

## 4. Validate

```bash
npm run validate
```

The script exits **0** only when the schema, rights rules, Steam CDN ban, referential integrity, and local `/media/` checksums all pass. It exits **non-zero** on the first failing catalog.

`npm test` re-runs the legal seed and asserts that a Steam CDN URL or `unknown` publishable/monetizable asset is rejected.

## 5. Ship

Commit the JSON, images, and checksum updates together. Do not add a bulk dump API or a CMS UI.
