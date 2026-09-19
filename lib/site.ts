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
  attributionPlaceholder:
    "Game data and media attribution will appear here when daily puzzles ship.",
} as const;
