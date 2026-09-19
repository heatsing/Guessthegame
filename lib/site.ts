export const site = {
  name: "GuessTheGame.net",
  product: "ThemeShot Daily",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://guessthegame.net",
  tagline:
    "A daily screenshot puzzle: guess the game from curated ThemeShot screenshots.",
  resetNote: "A new puzzle every day at 00:00 UTC.",
  playNote: "No ads, no extra modes — just one ThemeShot each day.",
  comingSoon: "Daily play is coming soon. No ads, no extra modes — just one ThemeShot each day.",
  disclaimer:
    "GuessTheGame.net is an independent ThemeShot Daily site. Not affiliated with guessthe.game.",
  /** Public legal/contact inbox. Override with NEXT_PUBLIC_CONTACT_EMAIL. */
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "legal@guessthegame.net",
  legalUpdated: "2026-09-19",
  rawg: {
    name: "RAWG",
    url: "https://rawg.io",
  },
  attributionPlaceholder:
    "Game metadata may include data from RAWG. RAWG does not grant screenshot or artwork rights. ThemeShot images are self-hosted with recorded rights.",
  /**
   * Google Search Console HTML-tag token. Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
   * in production after creating the URL-prefix property. Leave empty locally.
   */
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
} as const;

export function contactMailto(subject?: string): string {
  const base = `mailto:${site.contactEmail}`;
  if (!subject) return base;
  return `${base}?subject=${encodeURIComponent(subject)}`;
}
