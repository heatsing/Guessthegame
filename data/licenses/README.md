# License archive

Written permission and press-kit grant notes live here so every `media_assets`
row can point at an on-disk archive.

## Path

```
data/licenses/{game-slug}/{asset-id}.md
```

Use a `.pdf` (or a folder with the original email / kit zip) when the grant is
not a markdown note. Set `license_doc_url` to that repo-relative path.

Later, the same logical key can live in object storage:

```
s3://guessthegame-licenses/{env}/{game-slug}/{asset-id}/
```

and `license_doc_url` becomes that private URL or ticket. Do not put private
legal files in `public/`.

## Required fields in each note

- Date received
- Licensor / contact
- What was granted (still use on a daily puzzle site, ads yes/no)
- Original press-kit URL
- SHA-256 of the archived kit or still
- Operator who archived it

`can_monetize` stays `false` until the grant explicitly allows advertising.
`rights_status: unknown` cannot be monetized and cannot be `approved`.

Launch-window seed SVGs share [seed-placeholders.md](seed-placeholders.md).
That note is honest: they are original first-party placeholders, not publisher
press kits. Replace them before ads.

There is no player upload UI. Operators add files in Git (or the documented
bucket) only.
