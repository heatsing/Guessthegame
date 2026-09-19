export const primaryNav = [
  { href: "/", label: "Today" },
  { href: "/archive", label: "Archive" },
  { href: "/themes", label: "Themes" },
] as const;

export const legalNav = [
  { href: "/how-to-play", label: "How to play" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/dmca", label: "DMCA" },
  { href: "/copyright", label: "Copyright" },
] as const;

export const footerNav = [...primaryNav, ...legalNav] as const;

export type LegalHref = (typeof legalNav)[number]["href"];
