import { NextResponse } from "next/server";

import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { guessCatalogFromGames } from "@/lib/catalog/guess-index";
import type { GamesApiResponse } from "@/lib/daily/api-types";

export const runtime = "nodejs";

/** Catalog titles + aliases for autocomplete. Not an external search API. */
export function GET(): NextResponse<GamesApiResponse> {
  return NextResponse.json({
    games: guessCatalogFromGames(loadBundledCatalog().games),
  });
}
