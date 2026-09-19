# Media rights (seed)

GuessTheGame.net only ships **self-hosted** images that carry rights fields.

MVP policy (locked):

- Prefer official press kits with written permission to use the stills on a daily puzzle site that may later show ads
- Self-created placeholders are allowed in this seed so the schema can be tested; they are marked `rights_status: self_shot` and `can_monetize: false`
- Steam CDN / store artwork is **not** a license. Those URLs fail `npm run validate`
- `rights_status: unknown` may exist in the catalog for intake, but it cannot be `approved` and cannot have `can_monetize: true`

Replace placeholder SVGs under `public/media/placeholders/` before any production puzzle day. Keep the corresponding `license_doc_url` pointing at the archived permission (or this file for first-party placeholders).
