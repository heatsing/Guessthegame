import type { Metadata, MetadataRoute } from "next";

import { playGames } from "@/lib/play/games";
import { site } from "@/lib/site";

export const SITEMAP_STATIC_PATHS = [
  "/",
  "/how-to-play",
  "/about",
] as const;

export const homeTitle = `Online Guessing Games | ${site.name}`;
export const homeDescription =
  "Play free online guessing games with written clues. Guess movie and book titles, estimate measurements, or solve yes-or-no logic puzzles.";

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

export function buildSitemapEntries(origin: string = site.url): MetadataRoute.Sitemap {
  return [
    ...SITEMAP_STATIC_PATHS,
    ...playGames.map(({ slug }) => `/${slug}`),
  ].map((path) => ({ url: absoluteUrl(path, origin) }));
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
