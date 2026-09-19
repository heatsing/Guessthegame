import { NextResponse } from "next/server";

import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { guessCatalogFromGames } from "@/lib/catalog/guess-index";
import type { DailyApiResponse } from "@/lib/daily/api-types";
import { resolveReplayPuzzle } from "@/lib/daily/archive";
import { MAX_GUESSES } from "@/lib/daily/constants";
import { getDailyPuzzleDate } from "@/lib/daily/date";
import { getPlayableDaily, type PlayableDaily } from "@/lib/daily/load-puzzle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function okDaily(
  catalog: ReturnType<typeof loadBundledCatalog>,
  daily: PlayableDaily,
): NextResponse<DailyApiResponse> {
  return NextResponse.json({
    ok: true,
    date: daily.date,
    screenshots: daily.screenshots,
    maxGuesses: MAX_GUESSES,
    answer: daily.answer,
    games: guessCatalogFromGames(catalog.games),
  });
}

export function GET(request: Request): NextResponse<DailyApiResponse> {
  const catalog = loadBundledCatalog();
  const today = getDailyPuzzleDate();
  const requested = new URL(request.url).searchParams.get("date");

  if (requested !== null) {
    const date = requested.trim();
    const daily = resolveReplayPuzzle(catalog, date, today);
    if (!daily) {
      return NextResponse.json(
        { ok: false, date, reason: "not_ready" },
        { status: 404 },
      );
    }
    return okDaily(catalog, daily);
  }

  const daily = getPlayableDaily(catalog, today);
  if (!daily) {
    return NextResponse.json({ ok: false, date: today, reason: "not_ready" });
  }
  return okDaily(catalog, daily);
}
