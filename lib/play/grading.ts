import { currentResult, SIZE_ERROR_LIMIT } from "./result";
import { requiredReleaseYear, titleIdentifierIssue, type TitleIdentifierIssue } from "./title-identifiers";
import { PASS_ACCURACY, type PlayResult, type PlayRetry, type QuestionVersion } from "./types";

export type Grade =
  | { status: "invalid"; message: string }
  | PlayRetry
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

function titleAccuracy(
  guess: string,
  title: string,
  aliases: string[],
  gameSlug: string,
): { accuracy: number; message?: TitleIdentifierIssue } {
  const submitted = normalizeTitle(guess);
  const accepted = [title, ...aliases].map(normalizeTitle).filter(Boolean);
  const year = requiredReleaseYear(title);
  const yearIssue = year && year !== requiredReleaseYear(submitted)
    ? titleIdentifierIssue(submitted, normalizeTitle(title), gameSlug)
    : undefined;
  if (!yearIssue && accepted.includes(submitted)) return { accuracy: 100 };
  const candidates = accepted.map((answer) => {
    const score = percentage(titleSimilarity(submitted, answer));
    const message = yearIssue ?? titleIdentifierIssue(submitted, answer, gameSlug);
    return { score, message, accuracy: message ? Math.min(score, PASS_ACCURACY) : score };
  });
  return candidates.sort((a, b) => b.accuracy - a.accuracy || b.score - a.score)[0] ?? { accuracy: 0 };
}

function numberAccuracy(guess: number, target: number): number {
  if (target === 0) return guess === 0 ? 100 : 0;
  const error = Math.abs(guess - target) / target * 100;
  if (Math.abs(error - SIZE_ERROR_LIMIT) <= Number.EPSILON * 100) return PASS_ACCURACY;
  const raw = 100 - error;
  const rounded = percentage(raw);
  return rounded === PASS_ACCURACY ? raw : rounded;
}

export function withResultAccuracy(question: QuestionVersion, result: PlayResult): PlayResult {
  result = currentResult(result, question.gameSlug);
  if (result.accuracy !== undefined || result.outcome === "revealed" || result.outcome === "skipped") return result;
  const { answerConfig } = question;
  const { guess } = result;
  if (answerConfig.type === "title" && typeof guess === "string") {
    const { accuracy } = titleAccuracy(guess, answerConfig.answer, answerConfig.aliases, question.gameSlug);
    return { ...result, accuracy };
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
        return { status: "invalid", message: "Enter an answer before checking." };
      }
      const { accuracy, message } = titleAccuracy(guess, answerConfig.answer, answerConfig.aliases, question.gameSlug);
      if (accuracy <= PASS_ACCURACY) return { status: "retry", accuracy, ...(message && { message }) };
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
      if (accuracy <= PASS_ACCURACY) {
        return { status: "retry", accuracy, message: submitted < target ? "Too low" : "Too high" };
      }
      return {
        status: "settled",
        result: currentResult({ ...details, outcome: "within", accuracy, answer: target, guess: submitted, unit }, question.gameSlug),
      };
    }
    case "boolean":
      if (typeof guess !== "boolean") {
        return { status: "invalid", message: "Choose Yes or No." };
      }
      const correct = guess === answerConfig.answer;
      return {
        status: "settled",
        result: { ...details, outcome: correct ? "correct" : "incorrect", accuracy: correct ? 100 : 0, answer: answerConfig.answer, guess },
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
    result: currentResult({ outcome: "revealed", answer: answerConfig.answer, explanation, sources }, question.gameSlug),
  };
}
