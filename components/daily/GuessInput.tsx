"use client";

import { FormEvent, useState } from "react";

import type { GuessCatalogGame } from "@/lib/catalog/guess-index";
import { resolveGuessValue, suggestGames } from "@/lib/daily/autocomplete";

import { GuessAutocomplete } from "./GuessAutocomplete";

type GuessInputProps = {
  guessNumber: number;
  maxGuesses: number;
  disabled?: boolean;
  games: readonly GuessCatalogGame[];
  onGuess: (value: string) => void;
  onSkip: () => void;
};

export function GuessInput({
  guessNumber,
  maxGuesses,
  disabled = false,
  games,
  onGuess,
  onSkip,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  function submitGuess(raw: string) {
    const next = raw.trim();
    if (!next || disabled) return;
    onGuess(next);
    setValue("");
    setListOpen(false);
    setActiveIndex(-1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const suggestions = suggestGames(value, games);
    submitGuess(resolveGuessValue(value, suggestions, activeIndex, listOpen));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label
        htmlFor="daily-guess"
        className="text-sm font-medium text-[color:var(--foreground)]"
      >
        Guess {guessNumber} of {maxGuesses}
      </label>
      <GuessAutocomplete
        id="daily-guess"
        value={value}
        disabled={disabled}
        games={games}
        listOpen={listOpen}
        activeIndex={activeIndex}
        onListOpenChange={setListOpen}
        onActiveIndexChange={setActiveIndex}
        onChange={setValue}
        onSelectSuggestion={(suggestion) => {
          submitGuess(suggestion.title);
        }}
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
