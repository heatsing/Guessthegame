import type { GuessCatalogGame } from "@/lib/catalog/guess-index";

import type { DailyAnswer, PlayableScreenshot } from "./load-puzzle";

export type DailyApiOk = {
  ok: true;
  date: string;
  screenshots: PlayableScreenshot[];
  maxGuesses: number;
  answer: DailyAnswer;
  /** Slim catalog for autocomplete (titles + EN/ZH/JA aliases). */
  games: GuessCatalogGame[];
};

export type GamesApiResponse = {
  games: GuessCatalogGame[];
};

export type DailyApiEmpty = {
  ok: false;
  date: string;
  reason: "not_ready";
};

export type DailyApiResponse = DailyApiOk | DailyApiEmpty;
