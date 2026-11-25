import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { blogPath, posts } from "../lib/blog";
import {
  absoluteUrl,
  buildRobots,
  buildSitemapEntries,
  googleVerification,
  homeDescription,
  homeTitle,
  pageMetadata,
} from "../lib/seo";

const origin = "https://guessthegame.net";
const gamePaths = [
  "/guess-the-movie",
  "/guess-the-book",
  "/guess-the-word",
  "/guess-the-plant",
  "/guess-the-size",
  "/yes-or-no",
];

const urls = buildSitemapEntries(origin).map(({ url }) => url);
assert.deepEqual(
  urls,
  ["/", "/how-to-play", "/about", "/blog", ...gamePaths, ...posts.map(blogPath)].map((path) => absoluteUrl(path, origin)),
);
assert.equal(new Set(urls).size, urls.length);
assert.equal(absoluteUrl("/", origin + "/"), origin);
assert.equal(absoluteUrl("guess-the-book", origin), origin + "/guess-the-book");
assert.equal(buildRobots(origin).sitemap, origin + "/sitemap.xml");

const home = pageMetadata("/", homeTitle, homeDescription, { absoluteTitle: true });
assert.deepEqual(home.title, { absolute: "Online Guessing Games | Guess the Game" });
assert.match(home.description ?? "", /written clues/);
assert.equal(home.alternates?.canonical, "/");
assert.deepEqual(home.robots, { index: true, follow: true });
assert.equal(home.openGraph?.url, "/");
const game = pageMetadata("/guess-the-book", "Guess the Book From Clues", "Guess using a story clue.");
assert.equal(game.alternates?.canonical, "/guess-the-book");

assert.equal(googleVerification(" "), undefined);
assert.deepEqual(googleVerification(" abc123 "), { google: "abc123" });

const homePage = readFileSync("app/page.tsx", "utf8");
const sitemap = readFileSync("app/sitemap.ts", "utf8");
const robots = readFileSync("app/robots.ts", "utf8");
for (const [source, expected] of [
  [homePage, /pageMetadata\("\/", homeTitle, homeDescription/],
  [sitemap, /buildSitemapEntries\(\)/],
  [robots, /buildRobots\(site\.url\)/],
] as const) assert.match(source, expected);

console.log("Homepage and game metadata, canonical URLs, robots, and sitemap passed.");
