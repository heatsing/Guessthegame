# Guess the Game

[Guess the Game](https://guessthegame.net) is an English site for guessing from written clues. The first question renders on the server. Play continues on the same page with hints, answer explanations, and the next question.

- Guess the Movie at `/guess-the-movie`
- Guess the Book at `/guess-the-book`
- Guess the Size at `/guess-the-size`
- Yes or No? at `/yes-or-no`

The application uses Next.js App Router, TypeScript, and OpenNext for Cloudflare Workers. The separate Cloudflare D1 question bank is available through the `PLAY_DB` binding. Publishing a reviewed revision makes it available to new rounds without a site deployment.

## Local development

Use Node.js 20 or later.

```sh
npm ci
npx wrangler d1 migrations apply guessthegame-questions --local
npm run dev
```

Import and publish an editorial CSV in the local database to play with sample questions. The editor CLI, CSV fields, and revision workflow are documented in [question bank operations](docs/play-question-bank.md).

```sh
npm run lint
npm test
npm run build
```

## Production

The production Worker is named `guessthegame`. The deployment configuration binds the apex and `www` custom domains. The application redirects public page requests from `www` or HTTP to the HTTPS apex.

Apply any new database migration before deploying the release.

```sh
npx wrangler d1 migrations apply guessthegame-questions --remote
npm run deploy
```

Use the same Git revision for the production build and `main`. Confirm that the apex serves the homepage, the four playable routes with a first question, and `/sitemap.xml`.

Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, and optionally `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` at build time. Example values are in [the environment template](.env.example). See [Google Search Console](docs/google-search-console.md) for property verification and sitemap submission.
