# GuessTheGame.net (ThemeShot Daily)

Daily curated video-game screenshot guessing puzzle.

This repository currently ships a **crawlable SSR scaffold** for [https://guessthegame.net](https://guessthegame.net): brand homepage, header/footer, and Vercel deploy docs. Gameplay is intentionally not included yet.

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

Open [http://localhost:3000](http://localhost:3000). You should see **GuessTheGame.net**, **ThemeShot Daily**, and the one-line positioning copy.

Useful scripts:

```bash
npm run lint
npm run build
npm start
```

`npm run build` must succeed before opening a PR.

## Environment variables

Copy `.env.example` to `.env.local`. There are **no secrets** in this scaffold.

| Name | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical / Open Graph origin | `https://guessthegame.net` |

`.env.local` is gitignored. Do not commit API keys.

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

This Issue #1 scaffold does **not** add gameplay, ads, login, or multi-mode navigation.

## Docs

Project discovery and strategy live with the ops agent. The first batch of GitHub Issues tracks the MVP build.
