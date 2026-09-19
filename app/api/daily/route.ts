import { NextResponse } from "next/server";

import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { guessCatalogFromGames } from "@/lib/catalog/guess-index";
import { MAX_GUESSES } from "@/lib/daily/constants";
import { getDailyPuzzleDate } from "@/lib/daily/date";
import { getPlayableDaily } from "@/lib/daily/load-puzzle";
import type { DailyApiResponse } from "@/lib/daily/api-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): NextResponse<DailyApiResponse> {
  const date = getDailyPuzzleDate();
  const catalog = loadBundledCatalog();
  const daily = getPlayableDaily(catalog, date);

  if (!daily) {
    return NextResponse.json({ ok: false, date, reason: "not_ready" });
  }

  return NextResponse.json({
    ok: true,
    date: daily.date,
    screenshots: daily.screenshots,
    maxGuesses: MAX_GUESSES,
    answer: daily.answer,
    games: guessCatalogFromGames(catalog.games),
  });
}
