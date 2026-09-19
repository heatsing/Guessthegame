/**
 * SEO allowlist: sitemap paths, robots, per-page metadata, no puzzle URLs.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadBundledCatalog } from "../lib/catalog/bundled";
import {
  absoluteUrl,
  buildRobots,
  buildSitemapEntries,
  googleVerification,
  isPuzzlePath,
  listSitemapPaths,
  pageMetadata,
  SITEMAP_STATIC_PATHS,
} from "../lib/seo";
import { site } from "../lib/site";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expect(condition: unknown, message: string): void {
  if (!condition) fail(message);
}

const catalog = loadBundledCatalog();
const origin = "https://guessthegame.net";

expect(SITEMAP_STATIC_PATHS.includes("/"), "allowlist includes /");
expect(
  SITEMAP_STATIC_PATHS.includes("/how-to-play"),
  "allowlist includes /how-to-play",
);
expect(SITEMAP_STATIC_PATHS.includes("/about"), "allowlist includes /about");
expect(SITEMAP_STATIC_PATHS.includes("/archive"), "allowlist includes /archive");
expect(SITEMAP_STATIC_PATHS.includes("/themes"), "allowlist includes /themes hub");
expect(
  !SITEMAP_STATIC_PATHS.some((path) => isPuzzlePath(path)),
  "static allowlist has no /puzzle path",
);
console.log("ok — static allowlist");

const paths = listSitemapPaths(catalog.themes);
expect(paths.includes("/"), "sitemap paths include home");
expect(paths.includes("/themes/autumn-showcase"), "published autumn theme");
expect(paths.includes("/themes/indie-first-week"), "published indie theme");
expect(paths.includes("/themes/hearth-harvest"), "published hearth theme");
expect(paths.includes("/themes/labyrinth-logic"), "published labyrinth theme");
expect(paths.includes("/themes/far-roads"), "published far-roads theme");
expect(
  paths.every((path) => !isPuzzlePath(path)),
  "sitemap paths exclude /puzzle/*",
);
expect(
  !paths.some((path) => path.includes("/puzzle")),
  "no path contains /puzzle",
);

for (const puzzle of catalog.daily_puzzles) {
  expect(
    !paths.includes(`/puzzle/${puzzle.puzzle_date}`),
    `puzzle ${puzzle.puzzle_date} is not in the sitemap allowlist`,
  );
}

expect(
  !paths.includes("/privacy") &&
    !paths.includes("/terms") &&
    !paths.includes("/dmca") &&
    !paths.includes("/copyright"),
  "legal URLs stay off the sitemap allowlist",
);
console.log("ok — published themes in, puzzles and legal out");

const entries = buildSitemapEntries(catalog.themes, origin, "2026-09-19");
expect(entries.length === paths.length, "one sitemap entry per allowlist path");
expect(
  entries.every(
    (entry) => entry.url === origin || entry.url.startsWith(`${origin}/`),
  ),
  "sitemap locs use the site origin",
);
expect(
  entries.every((entry) => !entry.url.includes("/puzzle")),
  "sitemap locs never include /puzzle",
);
expect(
  entries.some((entry) => entry.url === origin),
  "homepage loc matches the canonical origin (no trailing slash)",
);
expect(
  entries.some((entry) => entry.url === `${origin}/how-to-play`),
  "how-to-play loc",
);
console.log("ok — sitemap entries");

const robots = buildRobots(origin);
expect(robots.sitemap === `${origin}/sitemap.xml`, "robots lists sitemap.xml");
expect(robots.host === origin, "robots host is the apex origin");
const rule = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;
expect(rule?.allow === "/", "robots allows /");
console.log("ok — robots.txt payload");

expect(absoluteUrl("/") === siteOriginFallback(), "home absolute URL");
expect(
  absoluteUrl("/archive", origin) === `${origin}/archive`,
  "archive absolute URL",
);
expect(isPuzzlePath("/puzzle/2026-09-19"), "dated puzzle path is a puzzle URL");
expect(isPuzzlePath("/puzzle"), "bare /puzzle is a puzzle URL");
expect(!isPuzzlePath("/archive"), "archive is not a puzzle URL");
console.log("ok — URL helpers");

function siteOriginFallback(): string {
  return site.url.replace(/\/+$/, "");
}

const homeMeta = pageMetadata(
  "/",
  "GuessTheGame.net — ThemeShot Daily | Daily Screenshot Puzzle",
  "A daily screenshot puzzle.",
  { absoluteTitle: true },
);
expect(
  typeof homeMeta.title === "object" &&
    homeMeta.title !== null &&
    "absolute" in homeMeta.title &&
    homeMeta.title.absolute.includes("GuessTheGame.net"),
  "home title is absolute and includes the brand",
);
expect(homeMeta.description?.includes("screenshot"), "home description");
expect(homeMeta.alternates?.canonical === "/", "home canonical");
expect(homeMeta.robots !== undefined, "home robots");
if (homeMeta.robots && typeof homeMeta.robots === "object") {
  expect(homeMeta.robots.index === true, "home is indexable");
}
expect(homeMeta.openGraph?.url === "/", "home OG url");
expect(
  JSON.stringify(homeMeta.twitter).includes("summary"),
  "home Twitter card",
);

const puzzleMeta = pageMetadata(
  "/puzzle/2026-09-19",
  "ThemeShot 2026-09-19",
  "Replay the 2026-09-19 ThemeShot.",
  { index: false },
);
if (puzzleMeta.robots && typeof puzzleMeta.robots === "object") {
  expect(puzzleMeta.robots.index === false, "puzzle pages are noindex");
  expect(puzzleMeta.robots.follow === true, "puzzle pages still follow");
}
expect(
  puzzleMeta.alternates?.canonical === "/puzzle/2026-09-19",
  "puzzle canonical stays on the replay URL",
);
console.log("ok — page metadata");

expect(googleVerification("") === undefined, "empty GSC token is omitted");
expect(googleVerification("   ") === undefined, "whitespace GSC token is omitted");
expect(
  googleVerification("abc123")?.google === "abc123",
  "GSC token becomes verification.google",
);
console.log("ok — GSC verification helper");

const puzzlePage = readFileSync(
  join(process.cwd(), "app/puzzle/[date]/page.tsx"),
  "utf8",
);
expect(puzzlePage.includes("index: false"), "puzzle generateMetadata sets noindex");
expect(
  puzzlePage.includes("pageMetadata"),
  "puzzle page uses the shared metadata helper",
);

const homePage = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
expect(homePage.includes("homeDescription"), "homepage exports description metadata");
expect(homePage.includes("pageMetadata"), "homepage uses the metadata helper");

const robotsSource = readFileSync(join(process.cwd(), "app/robots.ts"), "utf8");
expect(robotsSource.includes("buildRobots"), "robots.ts uses the shared builder");

const sitemapSource = readFileSync(join(process.cwd(), "app/sitemap.ts"), "utf8");
expect(sitemapSource.includes("buildSitemapEntries"), "sitemap.ts uses the allowlist");
expect(!sitemapSource.includes("/puzzle"), "sitemap route source never names /puzzle");

const gscDoc = readFileSync(
  join(process.cwd(), "docs/google-search-console.md"),
  "utf8",
);
expect(gscDoc.includes("HTML tag"), "GSC doc explains the HTML-tag method");
expect(gscDoc.includes("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"), "GSC doc names the env var");
expect(gscDoc.includes("sitemap.xml"), "GSC doc tells how to submit the sitemap");
expect(gscDoc.includes("/puzzle"), "GSC doc says puzzle URLs stay out");
console.log("ok — route sources and GSC doc");

console.log("seo tests passed");
