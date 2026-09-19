"use client";

import { FormEvent, useState } from "react";

type GuessInputProps = {
  guessNumber: number;
  maxGuesses: number;
  disabled?: boolean;
  onGuess: (value: string) => void;
  onSkip: () => void;
};

export function GuessInput({
  guessNumber,
  maxGuesses,
  disabled = false,
  onGuess,
  onSkip,
}: GuessInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = value.trim();
    if (!next || disabled) return;
    onGuess(next);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label
        htmlFor="daily-guess"
        className="text-sm font-medium text-[color:var(--foreground)]"
      >
        Guess {guessNumber} of {maxGuesses}
      </label>
      <input
        id="daily-guess"
        name="guess"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="send"
        placeholder="Type a game title"
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-white/15 bg-[color:var(--surface)] px-4 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] placeholder:text-[color:var(--muted)] focus-visible:ring-2 disabled:opacity-60"
      />
      <div className="grid grid-cols-2 gap-3">
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          className="min-h-12 rounded-xl bg-[color:var(--accent)] px-4 text-base font-semibold text-[#1a1408] outline-none ring-[color:var(--accent)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Guess
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSkip}
          className="min-h-12 rounded-xl border border-white/20 bg-transparent px-4 text-base font-semibold text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Skip
        </button>
      </div>
    </form>
  );
}
