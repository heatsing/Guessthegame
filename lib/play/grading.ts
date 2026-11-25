import { PASS_ACCURACY, type PlayResult, type QuestionVersion } from "./types";

export type Grade =
  | { status: "invalid"; message: string }
  | { status: "retry"; accuracy: number }
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

function percentage(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)) * 100) / 100;
}

function titleSimilarity(guess: string, answer: string): number {
  const left = Array.from(guess);
  const right = Array.from(answer);
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 0; i < left.length; i++) {
    let diagonal = row[0];
    row[0] = i + 1;
    for (let j = 0; j < right.length; j++) {
      const above = row[j + 1];
      const substitution = diagonal + Number(left[i] !== right[j]);
      row[j + 1] = Math.min(above + 1, row[j] + 1, substitution);
      diagonal = above;
    }
  }
  const length = Math.max(left.length, right.length);
  return (length - row[right.length]) / length * 100;
}

function titleAccuracy(guess: string, title: string, aliases: string[]): number {
  const submitted = normalizeTitle(guess);
  const accepted = [title, ...aliases].map(normalizeTitle).filter(Boolean);
  if (accepted.includes(submitted)) return 100;

  const best = Math.max(0, ...accepted.map((answer) => titleSimilarity(submitted, answer)));
  const requiredYear = /\((\d{4})\)$/.exec(title)?.[1];
  const submittedYear = /\((\d{4})\)$/.exec(submitted)?.[1];
  return percentage(requiredYear && requiredYear !== submittedYear ? Math.min(best, PASS_ACCURACY) : best);
}

function numberAccuracy(guess: number, target: number): number {
  if (target === 0) return guess === 0 ? 100 : 0;
  return percentage(100 - Math.abs(guess - target) / target * 100);
}

export function withResultAccuracy(question: QuestionVersion, result: PlayResult): PlayResult {
  if (result.accuracy !== undefined || result.outcome === "revealed") return result;
  const { answerConfig } = question;
  const { guess } = result;
  if (answerConfig.type === "title" && typeof guess === "string") {
    return { ...result, accuracy: titleAccuracy(guess, answerConfig.answer, answerConfig.aliases) };
  }
  if (answerConfig.type === "number" && typeof guess === "number") {
    return { ...result, accuracy: numberAccuracy(guess, answerConfig.target) };
  }
  if (answerConfig.type === "boolean" && typeof guess === "boolean") {
    return { ...result, accuracy: guess === answerConfig.answer ? 100 : 0 };
  }
  return result;
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
      const accuracy = titleAccuracy(guess, answerConfig.answer, answerConfig.aliases);
      if (accuracy <= PASS_ACCURACY) return { status: "retry", accuracy };
      return {
        status: "settled",
        result: { ...details, outcome: hintCount ? "assisted" : "correct", accuracy, answer: answerConfig.answer, guess },
      };
    }
    case "number": {
      const submitted = decimalGuess(guess);
      const { unit, target } = answerConfig;
      if (submitted === null) {
        return { status: "invalid", message: `Enter a non-negative number in ${unit}.` };
      }
      const accuracy = numberAccuracy(submitted, target);
      if (accuracy <= PASS_ACCURACY) return { status: "retry", accuracy };
      return {
        status: "settled",
        result: { ...details, outcome: "within", accuracy, answer: target, guess: submitted, unit },
      };
    }
    case "boolean":
      if (typeof guess !== "boolean") {
        return { status: "invalid", message: "Choose Yes or No." };
      }
      if (guess !== answerConfig.answer) return { status: "retry", accuracy: 0 };
      return {
        status: "settled",
        result: { ...details, outcome: "correct", accuracy: 100, answer: answerConfig.answer, guess },
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
