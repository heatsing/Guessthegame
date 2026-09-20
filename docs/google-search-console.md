# Google Search Console

GuessTheGame.net submits a **small allowlist** of URLs. Do not index every puzzle day or every game title.

Indexed (sitemap): `/`, `/how-to-play`, `/about`, `/archive`, `/themes`, and published `/themes/[slug]`.

Not in the sitemap: `/puzzle/*` (replay pages are `noindex,follow`), API routes, and legal pages (`/privacy`, `/terms`, `/dmca`, `/copyright`). Legal pages stay readable and can be crawled via the footer; they are not a discovery target.

## Verify the property

Use a **URL-prefix** property for `https://guessthegame.net` (apex). After `www` redirects to apex, do not add a second property for `www` unless Search Console asks you to.

### 1. HTML tag (recommended)

1. Open [Google Search Console](https://search.google.com/search-console) → **Add property** → **URL prefix** → `https://guessthegame.net`.
2. Choose **HTML tag**. Copy only the `content` value from the meta tag Google shows, for example `AbCDeF...` from:

   ```html
   <meta name="google-site-verification" content="AbCDeF..." />
   ```

3. In Cloudflare: Worker **guessthegame** → **Settings → Build** → **Build variables and secrets** (and the same names under runtime **Variables and Secrets** if you set them there too).
   - Name: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - Value: that token (no quotes).
   - Also set `NEXT_PUBLIC_SITE_URL=https://guessthegame.net` if it is not already set.
   - `NEXT_PUBLIC_*` is inlined at `next build` time, so a rebuild is required after changing it.
4. Redeploy production (push to `main` or retry the Workers Build) so `app/layout.tsx` can emit the meta tag.
5. View-source the homepage and confirm `<meta name="google-site-verification" content="...">` is present.
6. Back in Search Console, click **Verify**.

Locally you can put the same variable in `.env.local`. Do not commit the token.

### 2. HTML file

1. In the same verification screen, choose **HTML file**.
2. Download `google*.html`.
3. Place it in `public/` (repo root `public/google*.html`) so it is served at `https://guessthegame.net/google*.html`.
4. Deploy, then verify. Prefer the HTML-tag method so the file is not left in git.

### 3. DNS TXT

1. Choose **Domain** property (`guessthegame.net`) or the DNS method on a URL-prefix property.
2. Add the TXT record Google shows in the Cloudflare zone **DNS → Records** (same zone as the Worker custom domain).
3. Wait for DNS, then verify.

## Submit the sitemap

After the property is verified:

1. Search Console → the `https://guessthegame.net` property → **Sitemaps**.
2. Enter `sitemap.xml` (or the full `https://guessthegame.net/sitemap.xml`) → **Submit**.
3. Confirm Search Console lists the URL count and that none of the URLs contain `/puzzle/`.

`robots.txt` already points at `https://guessthegame.net/sitemap.xml`. You can inspect both with:

```bash
curl -sS https://guessthegame.net/robots.txt
curl -sS https://guessthegame.net/sitemap.xml
```

## URL Inspection

Use **URL Inspection** on `/` (expect indexable, description present) and on one `/puzzle/YYYY-MM-DD` replay (expect `noindex` / excluded). Do not request indexing for puzzle URLs.

## Internal linking checklist

Keep this graph; do not add per-game landing pages.

| From | Must link to |
| --- | --- |
| Header | `/`, `/archive`, `/how-to-play`, `/themes` |
| Footer | Today, Archive, Themes, How to play, About, Privacy, Terms, DMCA, Copyright |
| `/` | `/how-to-play`, `/archive`, `/themes` (and the current theme badge when a week is active) |
| `/how-to-play` | `/`, `/archive`, `/about` |
| `/about` | `/`, `/how-to-play`, `/archive`, `/copyright`, `/dmca` |
| `/archive` | `/`, `/puzzle/[date]` (replay only; those URLs stay noindex) |
| `/themes` | `/`, `/archive`, each `/themes/[slug]` |
| `/themes/[slug]` | `/`, `/archive`, `/themes`, published dates as `/puzzle/[date]` |
| `/puzzle/[date]` | `/`, `/archive` — never a “more games like X” farm |
| Legal pages | Each other via the shared “Also on this site” nav |

CTA rule: informational pages should send a player back to **today’s ThemeShot** (`/`). Archive and theme pages may list dates but must not put answers in titles, descriptions, or sitemap entries.
