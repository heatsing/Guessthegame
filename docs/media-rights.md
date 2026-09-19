# Media rights (seed)

GuessTheGame.net only ships **self-hosted** images that carry rights fields.
The operator pipeline (naming, license archive, takedown, SLA) is
[media-pipeline.md](media-pipeline.md).

MVP policy (locked):

- Prefer official press kits with written permission to use the stills on a daily puzzle site that may later show ads
- Self-created placeholders are allowed in this seed so the schema can be tested; they are marked `rights_status: self_shot` and `can_monetize: false`
- Steam CDN / store artwork is **not** a license. Those URLs fail `npm run validate`
- `rights_status: unknown` may exist in the catalog for intake, but it cannot be `approved` and cannot have `can_monetize: true`
- Written grants are archived under `data/licenses/{game-slug}/{asset-id}.md` (see that folder's README). `license_doc_url` must point at the archive

Replace placeholder SVGs under `public/media/placeholders/` before any production puzzle day. Keep the corresponding `license_doc_url` pointing at the archived permission (or this file for first-party placeholders).

`m-hades-pk-01` is a first-party **press-kit intake example** (`/media/hades/m-hades-pk-01.svg`) referenced by `2026-01-15`. It is not official artwork and is not ad-safe.

Playable placeholders must not include the game title (or aliases) in the image, `aria-label`, or visible text. Filenames may still be internal ids.
