# GuessTheGame.net (ThemeShot Daily)

Daily curated video-game screenshot guessing puzzle.

This repository ships [https://guessthegame.net](https://guessthegame.net): brand chrome plus the daily ThemeShot play loop on `/` (up to 6 screenshots, 6 guesses, Skip).

- Domain: https://guessthegame.net
- Product: ThemeShot Daily
- Repo: https://github.com/heatsing/Guessthegame
- Stack: Next.js App Router + TypeScript + ESLint (repo root)

## Local development

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see **GuessTheGame.net**, **ThemeShot Daily**, and today's puzzle (or **Puzzle not ready** if that UTC date has no seed).

Useful scripts:

```bash
npm run lint
npm run build
npm start
npm run validate
npm test
```

`npm run build` must succeed before opening a PR.

`npm run validate` checks the Git-managed catalog in `data/seed/` (schema, rights fields, Steam CDN ban, local media checksums) and exits non-zero on failure. `npm test` asserts the legal seed passes and that a Steam CDN URL or `unknown` publishable/monetizable asset is rejected. See [docs/catalog-validation.md](docs/catalog-validation.md) and [docs/add-daily-puzzle.md](docs/add-daily-puzzle.md).

## Environment variables

Copy `.env.example` to `.env.local`. There are **no secrets** in this scaffold.

| Name | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical / Open Graph origin | `https://guessthegame.net` |
| `DAILY_PUZZLE_DATE` | Optional UTC `YYYY-MM-DD` override for `/` and `/api/daily`. Leave unset in production. | `2026-01-15` |

`.env.local` is gitignored. Do not commit API keys.

Production should use the **real UTC date**. The seed catalog includes playable days for 2026-09-18 through 2026-09-21 (plus the January sample days) so a live demo works without an override. Use `DAILY_PUZZLE_DATE` only for local demos or tests.

## Deploy on Vercel

1. Import `heatsing/Guessthegame` in [Vercel](https://vercel.com/new).
2. Framework preset: **Next.js**. Root directory: `.` (repo root).
3. Set `NEXT_PUBLIC_SITE_URL=https://guessthegame.net` for Production.
4. Push to `main` (or merge a PR) to publish. Preview deployments are created for every PR.

### Bind `guessthegame.net`

After the first successful production deploy:

1. In the Vercel project: **Settings → Domains**.
2. Add `guessthegame.net` (apex) and `www.guessthegame.net`.
3. Redirect `www` → apex (`guessthegame.net`). The repo also includes a 308 from `www` to apex (`proxy.ts` + `vercel.json`).
4. At the domain registrar, apply the records Vercel shows. Typical values:

   | Host | Type | Value |
   | --- | --- | --- |
   | `@` | A | `10.0.1.2` (or the exact IP on the Vercel domain card) |
   | `www` | CNAME | the CNAME target shown in Vercel (often `cname.vercel-dns.com`) |

   Always prefer the exact records from the Vercel dashboard if they differ.
5. Wait for DNS + TLS. `https://guessthegame.net` should return **200** and the same homepage as the preview URL.

If production DNS is not ready yet, use the Vercel preview URL from the PR to verify the scaffold.

## MVP scope (locked)

- One daily puzzle (UTC midnight reset)
- Up to 6 screenshots / 6 guesses
- Local streak + spoiler-free share
- Press-kit self-hosted images only (no Steam CDN as CDN)
- No ads until rights coverage ≥ 90%
- No multi-mode / App / UGC in MVP

Daily play (Issue #3) lives on `/`. The answer is loaded in the browser after JavaScript runs so no-JS HTML does not contain the title. After a finished run, the result card offers a spoiler-free Wordle-style share (Issue #6): site name, puzzle date, emoji grid, score, and `https://guessthegame.net` — never the game title. Ads, login, and extra modes stay out of scope.

## Catalog (Issue #2)

Versioned puzzle data lives in `data/seed/` (`games`, `game_sources`, `media_assets`, `daily_puzzles`, `themes`). TypeScript + Zod types are in `lib/catalog/`. Seed screenshots are self-hosted placeholders under `public/media/placeholders/` with rights fields filled in — never Steam CDN URLs.

To schedule a day, follow [docs/add-daily-puzzle.md](docs/add-daily-puzzle.md), then `npm run validate`.

## Docs

- [How to add a daily puzzle](docs/add-daily-puzzle.md)
- [Catalog validation](docs/catalog-validation.md)
- [Media rights](docs/media-rights.md)

Project discovery and strategy live with the ops agent. The first batch of GitHub Issues tracks the MVP build.
