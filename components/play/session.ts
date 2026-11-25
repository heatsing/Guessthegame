import type { PlayResult, PublicRound } from "@/lib/play/types";

export type RoundState = {
  round: PublicRound | null;
  input: string;
  hints: string[];
  hintsExhausted: boolean;
  result: PlayResult | null;
  recentQuestionIds: string[];
  questionNumber: number;
  expired: boolean;
};

export const newRoundState = (
  round: PublicRound | null,
  history: string[] = [],
  questionNumber = 1,
): RoundState => ({
  round,
  input: "",
  hints: [],
  hintsExhausted: false,
  result: null,
  recentQuestionIds: round
    ? [round.questionId, ...history.filter((id) => id !== round.questionId)].slice(0, 200)
    : history,
  questionNumber,
  expired: false,
});

export function readRoundSession(key: string): { id: string; state: RoundState } | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (
      typeof saved?.id === "string" &&
      typeof saved.state?.round?.id === "string" &&
      typeof saved.state.input === "string" &&
      Array.isArray(saved.state.hints) &&
      Array.isArray(saved.state.recentQuestionIds)
    ) {
      return saved;
    }
  } catch {
    // A blocked or damaged browser store still allows a fresh round.
  }
  return null;
}

export function saveRoundSession(key: string, id: string, state: RoundState) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ id, state }));
  } catch {
    // Storage access is optional for a playable tab.
  }
}
