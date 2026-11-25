import { gradeAnswer, revealTitle, withResultAccuracy } from "./grading";
import { getQuestionStore, type QuestionStore } from "./store";
import { type PlayGame, type PrivateRound, type PublicRound } from "./types";

export function toPublicRound(round: PrivateRound): PublicRound {
  const { question } = round;
  return {
    id: round.id,
    questionId: question.questionId,
    revision: question.revision,
    prompt: question.prompt,
    answerType: question.answerConfig.type,
    ...(question.answerConfig.type === "number" ? { unit: question.answerConfig.unit } : {}),
  };
}

export async function loadGame(game: PlayGame, selection: { topic?: string; difficulty?: string }) {
  try {
    const store = await getQuestionStore();
    const [round, topics] = await Promise.all([
      store.startRound(game.slug, selection),
      store.listTopics(game.slug),
    ]);
    return { round: round && toPublicRound(round), topics };
  } catch (error) {
    console.error("Could not load first question", game.slug, error);
    return { round: null, topics: [] };
  }
}

type RoundRequest = { roundId: string; sessionId: string };
type RevisionRequest = RoundRequest & { revision: number };

export type RoundAction =
  | (RoundRequest & { action: "resume" })
  | (RevisionRequest & { action: "hint"; hintCount: number })
  | (RevisionRequest & { action: "check"; guess: string | number | boolean })
  | (RevisionRequest & { action: "reveal" });

const expired = {
  code: "expired",
  message: "This question is no longer available. Choose Start over to play again.",
};

export async function loadNextRound(
  store: QuestionStore,
  gameSlug: string,
  { roundId, sessionId, ...selection }: RoundRequest & NonNullable<Parameters<QuestionStore["startRound"]>[1]>,
) {
  const previous = await store.getRound(gameSlug, roundId);
  if (!previous || previous.sessionId !== sessionId) return { status: 410, body: expired };

  if (!previous.result) {
    return { status: 409, body: { message: "Finish this question before starting another." } };
  }

  const recentQuestionIds = [previous.question.questionId, ...(selection.recentQuestionIds ?? [])];
  const next = await store.startRound(gameSlug, { ...selection, recentQuestionIds, sessionId });
  return next
    ? { status: 200, body: { round: toPublicRound(next) } }
    : { status: 404, body: { message: "No questions are available for this selection." } };
}

export async function handleRoundAction(store: QuestionStore, gameSlug: string, request: RoundAction) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const round = await store.getRound(gameSlug, request.roundId);
    if (!round || (round.sessionId !== null && round.sessionId !== request.sessionId)) {
      return { status: 410, body: expired };
    }
    if (request.action !== "resume" && request.revision !== round.question.revision) {
      return { status: 410, body: expired };
    }

    const save = { sessionId: request.sessionId };
    const { question } = round;
    const result = round.result && withResultAccuracy(question, round.result);

    if (request.action === "resume") {
      if (!await store.saveRound(round, save)) continue;
      return {
        status: 200,
        body: {
          round: toPublicRound(round),
          hints: question.hints.slice(0, round.hintCount),
          hasMore: round.hintCount < question.hints.length,
          ...(result ? { result } : {}),
        },
      };
    }

    if (request.action === "hint") {
      if (result) return { status: 200, body: { hintCount: round.hintCount, hasMore: false, result } };
      const index = request.hintCount;
      if (index > round.hintCount) return { status: 409, body: { message: "Reload this question before asking for another hint." } };

      const hint = question.hints[index];
      const count = hint === undefined ? round.hintCount : index + 1;
      if (index === round.hintCount && hint !== undefined &&
          !await store.saveRound(round, { ...save, hintCount: count })) continue;
      return {
        status: 200,
        body: { hint, hintCount: count, hasMore: count < question.hints.length },
      };
    }

    if (result) return { status: 200, body: { status: "settled", result } };

    const grade = request.action === "check"
      ? gradeAnswer(question, request.guess, round.hintCount)
      : revealTitle(question);
    if (grade.status === "invalid") {
      return { status: 422, body: { code: "invalid", message: grade.message } };
    }
    if (grade.status === "retry") {
      if (round.sessionId === null && !await store.saveRound(round, save)) continue;
      return { status: 200, body: grade };
    }
    if (await store.saveRound(round, { ...save, result: grade.result })) {
      return { status: 200, body: grade };
    }
  }
  return { status: 409, body: { message: "The question is still updating. Try again." } };
}
