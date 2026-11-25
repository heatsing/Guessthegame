import type { PlayResult, QuestionVersion } from "./types";

export type Grade =
  | { status: "invalid"; message: string }
  | { status: "retry"; message: string }
  | { status: "settled"; result: PlayResult };

export function normalizeTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/\s+/g, " ");
}

function decimalGuess(guess: unknown) {
  if (typeof guess === "string") {
    const input = guess.trim();
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(input)) return null;
    guess = Number(input);
  }
  return typeof guess === "number" && Number.isFinite(guess) && guess >= 0 ? guess : null;
}

export function gradeAnswer(
  question: QuestionVersion,
  guess: unknown,
  hintCount: number,
): Grade {
  const { answerConfig, explanation, sources } = question;
  const details = { explanation, sources };

  switch (answerConfig.type) {
    case "title": {
      if (typeof guess !== "string" || !normalizeTitle(guess)) {
        return { status: "invalid", message: "Enter a title before checking." };
      }
      const submitted = normalizeTitle(guess);
      if (![answerConfig.answer, ...answerConfig.aliases].some((title) => normalizeTitle(title) === submitted)) {
        return { status: "retry", message: "Not quite. Try another title or take a hint." };
      }
      return {
        status: "settled",
        result: { ...details, outcome: hintCount ? "assisted" : "correct", answer: answerConfig.answer, guess },
      };
    }
    case "number": {
      const submitted = decimalGuess(guess);
      const { unit, target, min, max } = answerConfig;
      if (submitted === null) {
        return { status: "invalid", message: `Enter a non-negative number in ${unit}.` };
      }
      const outcome = submitted < min ? "low" : submitted > max ? "high" : "within";
      return {
        status: "settled",
        result: { ...details, outcome, answer: target, guess: submitted, unit, min, max },
      };
    }
    case "boolean":
      if (typeof guess !== "boolean") {
        return { status: "invalid", message: "Choose Yes or No." };
      }
      return {
        status: "settled",
        result: { ...details, outcome: guess === answerConfig.answer ? "correct" : "incorrect", answer: answerConfig.answer, guess },
      };
  }
}

export function revealTitle(question: QuestionVersion): Grade {
  const { answerConfig, explanation, sources } = question;
  if (answerConfig.type !== "title") {
    return { status: "invalid", message: "Submit an answer to see the explanation." };
  }
  return {
    status: "settled",
    result: { outcome: "revealed", answer: answerConfig.answer, explanation, sources },
  };
}
