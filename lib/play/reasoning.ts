const editorialPrefix = /^Key (clues?) — ("[^"]+"|“[^“”]+”)(?: and ("[^"]+"|“[^“”]+”))?\.\s+([\s\S]*)$/u;

export function answerReasoning(prompt: string, explanation: string): {
  clues: string[];
  explanation: string;
} {
  const fallback = { clues: [], explanation };
  const match = editorialPrefix.exec(explanation);
  if (!match) return fallback;

  const [, label, first, second, body] = match;
  if ((label === "clues") !== (second !== undefined)) return fallback;

  const clues = (second === undefined ? [first] : [first, second])
    .map((quote) => quote.slice(1, -1));
  const reasoning = body.trim();
  if (!reasoning || clues.some((clue) => !clue.trim() || !prompt.includes(clue))) {
    return fallback;
  }

  return { clues, explanation: reasoning };
}
