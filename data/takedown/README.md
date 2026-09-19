# Takedown quarantine

`npm run takedown` moves a public still out of `public/media/` into:

```
data/takedown/{media-id}/{original-filename}
```

That path is **not** served by Next.js. After the production deploy, the old
`/media/…` URL 404s and Daily no longer lists the slot.

Commit the catalog rewrite **and** the file move together. See
[docs/media-pipeline.md](../../docs/media-pipeline.md).
