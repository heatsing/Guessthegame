import type { Metadata, MetadataRoute } from "next";

import type { Theme } from "@/lib/catalog/schema";
import { site } from "@/lib/site";

/** High-priority URLs we submit to crawlers. Never add `/puzzle/*`. */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/how-to-play",
  "/about",
  "/archive",
  "/themes",
] as const;

export const homeTitle = `${site.name} — ${site.product} | Daily Screenshot Puzzle`;
export const homeDescription = `${site.name} is ${site.product}, a daily screenshot puzzle. Guess the game from curated screenshots. Not affiliated with guessthe.game.`;

export function siteOrigin(url: string = site.url): string {
  return url.replace(/\/+$/, "");
}

export function absoluteUrl(path: string, origin: string = site.url): string {
  const base = siteOrigin(origin);
  // Match Next.js metadataBase + canonical "/" → https://guessthegame.net
  if (path === "/") return base;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function isPuzzlePath(path: string): boolean {
  return path === "/puzzle" || path.startsWith("/puzzle/");
}

export function listPublishedThemePaths(themes: readonly Theme[]): string[] {
  return [...themes]
    .map((theme) => `/themes/${theme.slug}`)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Strict sitemap allowlist: static hubs + published theme landings.
 * Puzzle replay URLs are rejected even if a caller tries to pass them.
 */
export function listSitemapPaths(themes: readonly Theme[]): string[] {
  const paths = [
    ...SITEMAP_STATIC_PATHS,
    ...listPublishedThemePaths(themes),
  ];
  return paths.filter((path) => !isPuzzlePath(path));
}

type SitemapChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

function sitemapChangeFrequency(path: string): SitemapChangeFrequency {
  if (path === "/" || path === "/archive") return "daily";
  if (path === "/themes" || path.startsWith("/themes/")) return "weekly";
  return "monthly";
}

function sitemapPriority(path: string): number {
  if (path === "/") return 1;
  if (path === "/how-to-play") return 0.8;
  if (path === "/archive") return 0.7;
  return 0.6;
}

export function buildSitemapEntries(
  themes: readonly Theme[],
  origin: string = site.url,
  lastModified: string | Date = new Date(),
): MetadataRoute.Sitemap {
  return listSitemapPaths(themes).map((path) => ({
    url: absoluteUrl(path, origin),
    lastModified,
    changeFrequency: sitemapChangeFrequency(path),
    priority: sitemapPriority(path),
  }));
}

export function buildRobots(origin: string = site.url): MetadataRoute.Robots {
  const host = siteOrigin(origin);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}

export function googleVerification(
  token: string | undefined = site.googleSiteVerification,
): Metadata["verification"] | undefined {
  const value = token?.trim();
  if (!value) return undefined;
  return { google: value };
}

type PageMetadataOptions = {
  /** Use `title` as-is instead of appending ` — {site.name}`. */
  absoluteTitle?: boolean;
  index?: boolean;
  follow?: boolean;
};

export function pageMetadata(
  path: string,
  title: string,
  description: string,
  options: PageMetadataOptions = {},
): Metadata {
  const fullTitle = options.absoluteTitle
    ? title
    : `${title} — ${site.name}`;
  const index = options.index ?? true;
  const follow = options.follow ?? true;

  return {
    title: {
      absolute: fullTitle,
    },
    description,
    robots: {
      index,
      follow,
    },
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: site.name,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}
