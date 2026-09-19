# GuessTheGame.net (ThemeShot Daily)

Daily curated video-game screenshot guessing puzzle.

This repository ships [https://guessthegame.net](https://guessthegame.net): brand chrome plus the daily ThemeShot play loop on `/` (up to 6 screenshots, 6 guesses, Skip). `/archive` lists the last ~30 published days; `/puzzle/[YYYY-MM-DD]` replays a day with the same play components. `/themes` and `/themes/[slug]` cover Theme Week. Rules, About, Privacy, Terms, DMCA, and Copyright are static SSR pages (`/how-to-play`, `/about`, `/privacy`, `/terms`, `/dmca`, `/copyright`) linked from the footer. `/sitemap.xml` is an allowlist of those discovery URLs only — it never includes `/puzzle/*`. `/robots.txt` points crawlers at that sitemap.

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
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Search Console HTML-tag token. See [docs/google-search-console.md](docs/google-search-console.md). | *(empty until you verify)* |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public legal/contact inbox on Privacy, Terms, DMCA, and Copyright. | `legal@guessthegame.net` |
| `DAILY_PUZZLE_DATE` | Optional UTC `YYYY-MM-DD` override for `/`, `/archive`, `/puzzle/[date]`, and `/api/daily`. Leave unset in production. | `2026-01-15` |

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

Daily play (Issue #3) lives on `/`. Issue #4 adds catalog autocomplete on the guess field (titles plus EN/ZH/JA aliases, no external search). The answer is loaded in the browser after JavaScript runs so no-JS HTML does not contain the title. After a finished run, the result card offers a spoiler-free Wordle-style share (Issue #6): site name, puzzle date, emoji grid, score, and `https://guessthegame.net` — never the game title. Local stats (Issue #5) live in the same `themeshot.daily.v1` key: played UTC dates, win/loss counts, guess distribution, and a win streak. A loss still counts as played and breaks the win streak. Same-day replay is not counted twice. The archive hub (Issue #8) is `/archive` (indexable) and lists the last 30 already-open published days. `/puzzle/[YYYY-MM-DD]` reuses Daily play to replay a day and is `noindex,follow`. Future, unpublished, and invalid dates 404. Played dates are marked from localStorage.

Theme weeks (Issue #7) are the MVP differentiator. `data/seed/themes.json` stores `slug`, display name, unique description, and inclusive UTC `start_date` / `end_date`. The homepage shows a compact **This week's theme** badge (hidden when no window covers the current UTC day). `/themes` is a minimal list; `/themes/[slug]` is a server-rendered, indexable page with unique copy and published puzzle dates — never the answers. There is no account, cloud sync, or leaderboard. Ads, login, and extra modes stay out of scope.

SSR info and legal pages (Issue #9) are English, indexable, and readable without JavaScript: `/how-to-play` (rules + FAQ, with FAQ JSON-LD), `/about` (ThemeShot Daily positioning; not affiliated with guessthe.game), `/privacy`, `/terms`, `/dmca`, and `/copyright`. The DMCA page explains how to submit a notice and shows the public contact email (`NEXT_PUBLIC_CONTACT_EMAIL`). The footer links every page and includes a RAWG attribution backlink because the catalog stores RAWG ids. There is no CMS.

Technical SEO (Issue #10) uses the Metadata API on every public page (title, description, Open Graph, Twitter, canonical). `/robots.txt` allows `/` and lists `/sitemap.xml`. The sitemap is generated from published catalog themes plus a fixed hub allowlist (`/`, `/how-to-play`, `/about`, `/archive`, `/themes`, `/themes/[slug]`). Replay URLs under `/puzzle/` stay `noindex,follow` and are never written to the sitemap. Verify the production property with Search Console using [docs/google-search-console.md](docs/google-search-console.md).

## Catalog (Issue #2)

Versioned puzzle data lives in `data/seed/` (`games`, `game_sources`, `media_assets`, `daily_puzzles`, `themes`). TypeScript + Zod types are in `lib/catalog/`. Seed screenshots are self-hosted placeholders under `public/media/placeholders/` with rights fields filled in — never Steam CDN URLs.

To schedule a day, follow [docs/add-daily-puzzle.md](docs/add-daily-puzzle.md), then `npm run validate`.

## Docs

- [How to add a daily puzzle](docs/add-daily-puzzle.md)
- [Catalog validation](docs/catalog-validation.md)
- [Media rights](docs/media-rights.md)
- [Google Search Console](docs/google-search-console.md)

Project discovery and strategy live with the ops agent. The first batch of GitHub Issues tracks the MVP build.
