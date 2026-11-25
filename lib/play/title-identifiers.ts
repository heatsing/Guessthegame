export type TitleIdentifierIssue =
  | "Check the sequel number."
  | "Check the volume number."
  | "Check the release year.";

const releaseYearSuffix = /\s*\((\d{4})\)\s*$/;
const markedNumber = /\b(?:part|episode|chapter|book|volume|vol)(?:\.\s*|\s+)([a-z]+|\d+)(?![\p{L}\p{N}])/giu;
const bareNumber = /(?:(?:\s+|[:–—-]\s*)(\d{1,3}|[ivxlcdm]{1,7})|(?<=\p{L})(\d{1,3}))[.!?]?(?=$|\s*(?::|[–—])|\s+-\s)/giu;
const romanForm = /^m{0,3}(?:cm|cd|d?c{0,3})(?:xc|xl|l?x{0,3})(?:ix|iv|v?i{0,3})$/;
const romanDigits: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
const numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

export function requiredReleaseYear(title: string) {
  return releaseYearSuffix.exec(title.normalize("NFKC"))?.[1];
}

function installmentValue(value: string, marked: boolean): string | undefined {
  const token = value.toLowerCase();
  if (/^\d+$/.test(token)) return token.replace(/^0+(?=\d)/, "");
  const wordNumber = numberWords.indexOf(token);
  if (marked && wordNumber >= 0) return String(wordNumber);
  if (!token || !romanForm.test(token)) return undefined;

  const digits = Array.from(token, (letter) => romanDigits[letter]);
  const number = digits.reduce((total, digit, index) =>
    total + (digit < digits[index + 1] ? -digit : digit), 0);
  // Unmarked Roman numerals also resemble words such as "mix".
  return marked || number <= 99 ? String(number) : undefined;
}

function installments(title: string) {
  const text = title.normalize("NFKC").replace(releaseYearSuffix, "").trim();
  const values = new Map<number, string>();

  for (const match of text.matchAll(markedNumber)) {
    const value = installmentValue(match[1], true);
    if (value === undefined) continue;
    const end = match.index + match[0].length;
    const isBookPronoun = /^book\s+i$/i.test(match[0]) && /^\s+\p{L}/u.test(text.slice(end));
    if (isBookPronoun) continue;
    values.set(end - match[1].length, value);
  }

  for (const suffix of text.matchAll(bareNumber)) {
    const token = suffix[1] ?? suffix[2];
    const position = suffix.index + suffix[0].lastIndexOf(token);
    if (values.has(position)) continue;
    const stem = text.slice(0, suffix.index);
    const isPronoun = token.toLowerCase() === "i" && /\b(?:and|am|can|did|do|may|shall|should|was|were|will|would)$/i.test(stem);
    if (/\p{L}/u.test(stem) && !isPronoun) {
      const value = installmentValue(token, false);
      if (value !== undefined) values.set(position, value);
    }
  }

  return [...values].sort(([left], [right]) => left - right).map(([, value]) => value);
}

export function titleIdentifierIssue(
  guess: string,
  expected: string,
  gameSlug: string,
): TitleIdentifierIssue | undefined {
  if (gameSlug !== "guess-the-movie" && gameSlug !== "guess-the-book") return undefined;

  const year = requiredReleaseYear(expected);
  if (year && requiredReleaseYear(guess) !== year) return "Check the release year.";

  const guessNumbers = installments(guess);
  const expectedNumbers = installments(expected);
  if (
    guessNumbers.length !== expectedNumbers.length ||
    guessNumbers.some((number, index) => number !== expectedNumbers[index])
  ) {
    return gameSlug === "guess-the-movie" ? "Check the sequel number." : "Check the volume number.";
  }
}
