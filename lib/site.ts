export const site = {
  name: "Guess the Game",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://guessthegame.net",
  /** Public legal/contact inbox. Override with NEXT_PUBLIC_CONTACT_EMAIL. */
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "legal@guessthegame.net",
  legalUpdated: "2026-11-25",
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
