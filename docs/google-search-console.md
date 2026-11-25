# Google Search Console

Use the URL-prefix property `https://guessthegame.net` for canonical homepage and game URLs.

## Verify with an HTML tag

1. Open [Google Search Console](https://search.google.com/search-console), add a URL-prefix property for `https://guessthegame.net`, and select **HTML tag**.
2. Copy the value of the tag's `content` attribute into the build environment as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
3. Rebuild and deploy. Open the homepage source and check that the `google-site-verification` meta tag appears, then select **Verify** in Search Console.

To verify a Domain property by DNS, add the provided TXT record to the active `guessthegame.net` zone in Cloudflare and complete verification in Search Console.

## Submit and inspect the sitemap

1. In the verified property, open **Sitemaps** and submit `sitemap.xml`.
2. Check that the sitemap lists the homepage, How to Play, About, and the four playable game pages.
3. Inspect the homepage and a playable game URL. Each should report its own canonical HTTPS apex URL. The game's first question and controls appear in the server-rendered page.

[robots.txt](https://guessthegame.net/robots.txt) points to the [sitemap](https://guessthegame.net/sitemap.xml). The sitemap lists public game pages and informational pages used for discovery. Round APIs and preview cards stay outside the sitemap.
