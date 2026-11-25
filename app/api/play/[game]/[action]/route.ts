import { z } from "zod";

import { findPlayGame } from "@/lib/play/games";
import { handleRoundAction, loadNextRound } from "@/lib/play/service";
import { getQuestionStore } from "@/lib/play/store";

const session = z.object({ sessionId: z.string().uuid() });
const round = session.extend({ roundId: z.string().uuid() });
const revision = round.extend({ revision: z.number().int().positive() });

const actionPayload = z.discriminatedUnion("action", [
  round.extend({
    action: z.literal("next"),
    recentQuestionIds: z.array(z.string().max(160)).max(200).optional(),
    topic: z.string().max(80).optional(),
    difficulty: z.string().max(40).optional(),
    prefetch: z.boolean().optional(),
  }),
  round.extend({ action: z.literal("resume") }),
  revision.extend({ action: z.literal("hint"), hintCount: z.number().int().min(0).max(2) }),
  revision.extend({
    action: z.literal("check"),
    guess: z.union([z.string().max(320), z.number(), z.boolean()]),
  }),
  revision.extend({ action: z.literal("reveal") }),
]);

function reply(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
  });
}

export async function POST(request: Request, { params }: RouteContext<"/api/play/[game]/[action]">) {
  const { game, action } = await params;
  if (!findPlayGame(game)) return reply({ message: "Game not found." }, 404);
  if (Number(request.headers.get("content-length")) > 40_000) {
    return reply({ message: "This request is too large." }, 413);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return reply({ message: "Send a JSON request." }, 400);
  }

  const data = actionPayload.safeParse({
    ...(typeof payload === "object" && payload !== null ? payload : {}),
    action,
  });
  if (!data.success) return reply({ message: "Check the requested action and try again." }, 400);

  try {
    const store = await getQuestionStore();
    if (data.data.action === "next") {
      const result = await loadNextRound(store, game, data.data);
      return reply(result.body, result.status);
    }

    const result = await handleRoundAction(store, game, data.data);
    return reply(result.body, result.status);
  } catch (error) {
    console.error("Play request failed", game, action, error);
    return reply({ message: "Could not reach the game. Try again." }, 503);
  }
}
