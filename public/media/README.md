# Media storage

MVP stills are Git-managed files under this folder and served as `/media/…`.

## Naming

| Kind | Path |
| --- | --- |
| Press kit / licensed / self-shot | `{game-slug}/{asset-id}.{ext}` → `/media/{game-slug}/{asset-id}.{ext}` |
| Seed placeholders | `placeholders/{name}.{ext}` |
| Theme heroes (seed) | `placeholders/theme-{slug}.svg` |

Allowed extensions: `webp`, `jpg`, `jpeg`, `png`, `svg` (SVG is for seed
placeholders and pipeline demos only).

Object-storage keys, when we leave Git, use the same suffix:

```
s3://guessthegame-media/{env}/media/{game-slug}/{asset-id}.{ext}
```

`storage_url` in `data/seed/media_assets.json` stays the public path
(`/media/…` or the same path on `https://media.guessthegame.net`). Steam CDN
hosts are forbidden.

Do not add a player upload UI. Intake is operator-only; see
[docs/media-pipeline.md](../../docs/media-pipeline.md).
