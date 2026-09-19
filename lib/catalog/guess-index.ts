import type { Game, LocaleAliases } from "./schema";

/** Slim catalog row for client autocomplete (id / title / aliases only). */
export type GuessCatalogGame = {
  id: string;
  title: string;
  aliases: LocaleAliases;
};

export function guessCatalogFromGames(
  games: readonly Game[],
): GuessCatalogGame[] {
  return games
    .filter((game) => game.status === "active")
    .map((game) => ({
      id: game.id,
      title: game.title,
      aliases: game.aliases,
    }));
}
