# Media pipeline (press-kit intake + takedown)

Operator-only. There is **no player upload UI** and no UGC in MVP.

Boss lock: official press kit or written permission, self-hosted stills, no
Steam CDN, no ads until rights coverage is high enough (`can_monetize` is
per-asset; do not flip it on for `unknown`).

## Storage and naming

MVP files live in Git:

```
public/media/{game-slug}/{asset-id}.{ext}
```

Served as `/media/{game-slug}/{asset-id}.{ext}`. Seed placeholders may stay
under `public/media/placeholders/`.

| Field | Rule |
| --- | --- |
| `{game-slug}` | `games.slug` (lowercase kebab-case) |
| `{asset-id}` | `media_assets.id` (e.g. `m-hades-pk-01`) |
| `{ext}` | `webp` preferred; `jpg` / `png` allowed; `svg` for seed / pipeline demos |

`storage_url` is that public path. Do not put a Steam host in `storage_url`.

### Object storage (same key, later)

When stills leave Git, keep the **same suffix**:

```
s3://guessthegame-media/{env}/media/{game-slug}/{asset-id}.{ext}
```

Public URL (example):

```
https://media.guessthegame.net/media/{game-slug}/{asset-id}.{ext}
```

`{env}` is `prod` or `preview`. Catalog ids do not change. `npm run validate`
accepts a non-Steam origin whose pathname is `/media/{slug}/{id}.{ext}`.

## License archive

Every known-rights row (`press_kit`, `self_shot`, `licensed`) needs a written
archive. MVP path:

```
data/licenses/{game-slug}/{asset-id}.md
```

Set `license_doc_url` to that repo-relative path (or a later private bucket
URL). See [data/licenses/README.md](../data/licenses/README.md).

Required note contents: date received, licensor / contact, grant scope
(puzzle site + ads yes/no), original press-kit URL, checksum, operator.

Private legal PDFs must **not** be copied into `public/`.

## Rights fields

Fill every `media_assets` column:

| Field | Notes |
| --- | --- |
| `rights_status` | `press_kit` \| `self_shot` \| `licensed` \| `unknown` |
| `licensor` | Who granted the still (empty only while `unknown`) |
| `license_doc_url` | Archive path or URL |
| `attribution_text` | On-page credit |
| `can_monetize` | `true` only with a known, ad-safe grant |
| `moderation_status` | `approved` \| `rejected` \| `takedown` |
| `takedown_at` / `takedown_reason` | Required when status is `takedown` |

Hard rules enforced by `npm run validate`:

- Steam CDN hosts are forbidden on `storage_url` and theme `hero_image`
- An `approved` row cannot use a Steam CDN URL
- `unknown` cannot have `can_monetize: true`
- `unknown` cannot be `approved` (not publishable)
- `scheduled` / `published` Daily rows may only reference `approved`,
  known-rights assets
- Takedown rows cannot stay `can_monetize: true`

## Press-kit intake (operator)

1. Confirm written permission for a **guessing site that may later show ads**.
2. Archive the grant under `data/licenses/{game-slug}/{asset-id}.md` (or PDF).
3. Drop the still at `public/media/{game-slug}/{asset-id}.webp`.
4. `sha256sum` the file; put the hex in `checksum`.
5. Append `media_assets` with the rights fields. `moderation_status` stays
   off `approved` until the archive is complete.
6. Reference the id from `daily_puzzles.asset_ids` (1–6, reveal order).
7. Run `npm run validate`. Commit images, JSON, and the archive together.

Worked seed example: `m-hades-pk-01` →
`public/media/hades/m-hades-pk-01.svg` →
`data/licenses/hades/m-hades-pk-01.md` →
`p-2026-01-15` (`2026-01-15`). It is a first-party pipeline demo
(`can_monetize: false`), not a publisher license.

## Takedown

```bash
npm run takedown -- --id m-hades-pk-01 --reason "DMCA notice 2026-09-19"
npm run takedown -- --id m-hades-pk-01 --reason "preview" --dry-run
npm run takedown -- --id m-hades-pk-01 --reason "no swap" --no-backup
```

The script:

1. Sets `moderation_status: takedown`, `can_monetize: false`, `takedown_*`
2. Moves the public file to `data/takedown/{media-id}/`
3. Rewrites Daily slots that listed the id:
   - **Replace** with another approved, known-rights shot for the same game
   - or **skip** that slot if none (`--no-backup` always skips)
   - or **pull** the puzzle if no approved slot remains
4. Re-runs catalog + local file + license-archive checks

Play / archive / replay already omit non-approved shots
(`getPlayableDaily`). After a takedown, validate and preview must not show
the image.

### SLA (minutes, deploy-bound)

The catalog is bundled at build time. Removing a still from production means:

1. Commit the JSON rewrite + quarantine move
2. Push / merge to `main`
3. Wait for the **production** Vercel deploy

Typical window: a few minutes after the production deploy succeeds. Preview
URLs update on the PR deploy only. Until production is live, the previous
bundle can still serve the old `/media/…` file. If a CDN edge still has the
object after deploy, purge that path; Vercel production deploys normally
replace the asset graph with the new build.

Do not wait on a 24–72h ticket queue for an in-repo still — the script plus
deploy is the 5-minute path.

## Out of scope

- Player / UGC upload forms
- Ad UI (ads stay off until coverage policy is met)
- Bulk public dumps of the catalog
