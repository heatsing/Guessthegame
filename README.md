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

`npm run build` (`next build`) must succeed before opening a PR. Cloudflare production uses `npx opennextjs-cloudflare build`, which invokes that same `build` script and then adapts the output for Workers.

`npm run validate` checks the Git-managed catalog in `data/seed/` (schema, rights fields, Steam CDN ban, `/media/{slug}/{id}` naming, license archives, local media checksums) and exits non-zero on failure. `npm test` asserts the legal seed passes, that a Steam CDN URL or `unknown` publishable/monetizable asset is rejected, and that takedown by media id skips or replaces Daily slots. See [docs/catalog-validation.md](docs/catalog-validation.md), [docs/media-pipeline.md](docs/media-pipeline.md), and [docs/add-daily-puzzle.md](docs/add-daily-puzzle.md).

```bash
npm run takedown -- --id m-hades-pk-01 --reason "DMCA notice" --dry-run
```

## Environment variables

Copy `.env.example` to `.env.local`. There are **no secrets** in this scaffold.

| Name | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical / Open Graph origin | `https://guessthegame.net` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional Search Console HTML-tag token. See [docs/google-search-console.md](docs/google-search-console.md). | *(empty until you verify)* |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public legal/contact inbox on Privacy, Terms, DMCA, and Copyright. | `legal@guessthegame.net` |
| `DAILY_PUZZLE_DATE` | Optional UTC `YYYY-MM-DD` override for `/`, `/archive`, `/puzzle/[date]`, and `/api/daily`. Leave unset in production. | `2026-01-15` |

`.env.local` is gitignored. Do not commit API keys.

Production should use the **real UTC date**. The seed catalog includes **60 consecutive** playable days from **2026-09-18** through **2026-11-16** (plus the January sample days) so launch does not go dark. Use `DAILY_PUZZLE_DATE` only for local demos or tests. Launch stills are original first-party SVG placeholders (`can_monetize: false`) — swap in real press kits before AdSense.

## Deploy on Cloudflare Workers (OpenNext)

Production is **Cloudflare Workers** via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare/get-started). Do not import this repo into Vercel. `npm run build` stays `next build`; OpenNext calls that script, then emits `.open-next/` for Wrangler.

Local Workers preview (no Cloudflare token required):

```bash
cp .dev.vars.example .dev.vars
npm run preview
```

`npm run deploy` / `npm run upload` need `npx wrangler login` (or `CLOUDFLARE_API_TOKEN`) on the operator's machine. This repo does not store account credentials.

### Git integration (Workers Builds)

The Cloudflare account is already connected to GitHub. After this config lands on `main`:

1. Open [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → **Create** → **Workers** → import a git repository (or open the existing Worker named `guessthegame`).
2. Git account: the org/user that owns `heatsing/Guessthegame`. Repository: **heatsing/Guessthegame**. Production branch: **main**. Root directory: `/` (repo root).
3. Build settings:

   | Setting | Value |
   | --- | --- |
   | **Build command** | `npx opennextjs-cloudflare build` |
   | **Deploy command** | `npx opennextjs-cloudflare deploy` |
   | **Non-production branch deploy command** | `npx opennextjs-cloudflare upload` |

   Do **not** set the deploy command to `npm run deploy`. That script already runs `opennextjs-cloudflare build` and would compile twice. Workers Builds installs `npm` dependencies automatically.
4. **Build variables and secrets** (Workers Builds → Settings → Build). `NEXT_PUBLIC_*` is inlined at build time, so these must be **build** variables, not only runtime vars:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://guessthegame.net` |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | `legal@guessthegame.net` |
   | `NEXTJS_ENV` | `production` |

   Optional: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (Search Console token). Leave `DAILY_PUZZLE_DATE` unset in production.
5. Save, then push / merge to `main`. Confirm the production Worker serves `/`, `/api/daily`, and `/api/games` (JSON, not an HTML error). Until the custom domain is attached, use the `*.workers.dev` URL from the build.

### Custom domain + DNS cutover (boss / ops)

`https://guessthegame.net` currently still points at Vercel (`DEPLOYMENT_NOT_FOUND`). Point the zone **away from Vercel** to this Worker.

1. Confirm the `guessthegame.net` zone lives on Cloudflare (registrar nameservers are Cloudflare's). If nameservers still point at the old registrar/Vercel, change them first and wait for DNS.
2. After a green production Worker deploy: Worker **Settings → Domains & Routes → Add → Custom Domain** → `guessthegame.net` (apex only). Cloudflare creates the proxied DNS record and the certificate.
3. In **DNS → Records**, delete leftover **Vercel** records, typically:

   | Host | Type | Old Vercel value (delete) |
   | --- | --- | --- |
   | `@` | A | `10.0.1.2` (or whatever Vercel showed) |
   | `www` | CNAME | `cname.vercel-dns.com` (or similar) |

   Do **not** add `www.guessthegame.net` as a Worker custom domain. This app has no `proxy.ts` / Vercel redirects; www must be handled by a zone Redirect Rule (below).
4. In the Vercel project, remove `guessthegame.net` and `www.guessthegame.net` so Vercel stops expecting those hostnames.
5. Wait for DNS + TLS. `https://guessthegame.net` should return **200** with ThemeShot Daily. `https://www.guessthegame.net/…` should **308** to the apex (next section).

### www → apex (308)

OpenNext does not rely on Next.js `proxy.ts` here. Configure the redirect on Cloudflare so `www` and apex never both serve content (duplicate-host SEO).

**Preferred — Redirect Rule (Wildcard pattern)**

1. Zone **Rules → Redirect Rules → Create rule**.
2. Name: `www to apex`.
3. **When incoming requests match** → **Wildcard pattern**.
4. Request URL: `https://www.guessthegame.net/*`
5. Then → Target URL: `https://guessthegame.net/${1}` · Status code: **308** · Preserve query string: **on**.
6. Deploy the rule.
7. DNS for `www` must be **proxied** (orange cloud) so the rule can fire. If `www` is not a Worker custom domain, add a dummy proxied record: `www` **A** `192.0.2.0` (or **AAAA** `100::`). Those addresses are originless placeholders; Cloudflare intercepts the request and applies the 308.

Equivalent custom expression: `http.host eq "www.guessthegame.net"` → dynamic URL `concat("https://guessthegame.net", http.request.uri.path)` with query preserved, status **308**.

**Alternative — Workers route**

If you would rather not use Redirect Rules, attach a **separate** tiny Worker (or a route on another script) to `www.guessthegame.net/*` that returns `308` to `https://guessthegame.net/$1`. Do **not** bind `www` to the `guessthegame` OpenNext Worker: that Worker has no host redirect, so both hosts would serve the app.

### Local scripts

| Script | What it does |
| --- | --- |
| `npm run build` | `next build` only (also used by OpenNext) |
| `npm run preview` | OpenNext build + Wrangler local Workers runtime |
| `npm run deploy` | OpenNext build + deploy to Cloudflare (needs auth) |
| `npm run upload` | OpenNext build + version upload (needs auth) |
| `npm run cf-typegen` | Generate `cloudflare-env.d.ts` from `wrangler.jsonc` |

## MVP scope (locked)

- One daily puzzle (UTC midnight reset)
- Up to 6 screenshots / 6 guesses
- Local streak + spoiler-free share
- Press-kit self-hosted images only (no Steam CDN as CDN)
- No ads until rights coverage ≥ 90%
- No multi-mode / App / UGC in MVP

Daily play (Issue #3) lives on `/`. Issue #4 adds catalog autocomplete on the guess field (titles plus EN/ZH/JA aliases, no external search). The answer is loaded in the browser after JavaScript runs so no-JS HTML does not contain the title. After a finished run, the result card offers a spoiler-free Wordle-style share (Issue #6): site name, puzzle date, emoji grid, score, and `https://guessthegame.net` — never the game title. Local stats (Issue #5) live in the same `themeshot.daily.v1` key: played UTC dates, win/loss counts, guess distribution, and a win streak. A loss still counts as played and breaks the win streak. Same-day replay is not counted twice. The archive hub (Issue #8) is `/archive` (indexable) and lists the last 30 already-open published days. `/puzzle/[YYYY-MM-DD]` reuses Daily play to replay a day and is `noindex,follow`. Future, unpublished, and invalid dates 404. Played dates are marked from localStorage.

Theme weeks (Issue #7) are the MVP differentiator. `data/seed/themes.json` stores `slug`, display name, unique description, and inclusive UTC `start_date` / `end_date`. The homepage shows a compact **This week's theme** badge (hidden when no window covers the current UTC day). `/themes` is a minimal list; `/themes/[slug]` is a server-rendered, indexable page with unique copy and published puzzle dates — never the answers. The first launch block is Autumn Showcase, Hearth & Harvest, Labyrinth Logic, and Far Roads (Issue #12). There is no account, cloud sync, or leaderboard. Ads, login, and extra modes stay out of scope.

SSR info and legal pages (Issue #9) are English, indexable, and readable without JavaScript: `/how-to-play` (rules + FAQ, with FAQ JSON-LD), `/about` (ThemeShot Daily positioning; not affiliated with guessthe.game), `/privacy`, `/terms`, `/dmca`, and `/copyright`. The DMCA page explains how to submit a notice and shows the public contact email (`NEXT_PUBLIC_CONTACT_EMAIL`). The footer links every page and includes a RAWG attribution backlink because the catalog stores RAWG ids. There is no CMS.

Technical SEO (Issue #10) uses the Metadata API on every public page (title, description, Open Graph, Twitter, canonical). `/robots.txt` allows `/` and lists `/sitemap.xml`. The sitemap is generated from published catalog themes plus a fixed hub allowlist (`/`, `/how-to-play`, `/about`, `/archive`, `/themes`, `/themes/[slug]`). Replay URLs under `/puzzle/` stay `noindex,follow` and are never written to the sitemap. Verify the production property with Search Console using [docs/google-search-console.md](docs/google-search-console.md).

## Catalog (Issue #2)

Versioned puzzle data lives in `data/seed/` (`games`, `game_sources`, `media_assets`, `daily_puzzles`, `themes`). TypeScript + Zod types are in `lib/catalog/`. Seed screenshots are self-hosted under `public/media/` (placeholders plus the press-kit intake example `public/media/hades/m-hades-pk-01.svg`) with rights fields filled in — never Steam CDN URLs. Written grants are archived in `data/licenses/`.

To schedule a day, follow [docs/add-daily-puzzle.md](docs/add-daily-puzzle.md), then `npm run validate`.

## Docs

- [How to add a daily puzzle](docs/add-daily-puzzle.md)
- [Catalog validation](docs/catalog-validation.md)
- [Media pipeline (intake + takedown)](docs/media-pipeline.md)
- [Media rights](docs/media-rights.md)
- [Google Search Console](docs/google-search-console.md)
- Cloudflare Workers Git deploy + DNS cutover: see **Deploy on Cloudflare Workers** above

Project discovery and strategy live with the ops agent. The first batch of GitHub Issues tracks the MVP build.
