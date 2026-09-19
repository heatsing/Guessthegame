"use client";

import { KeyboardEvent, useEffect, useId, useMemo, useRef } from "react";

import type { GuessCatalogGame } from "@/lib/catalog/guess-index";
import {
  MAX_GUESS_INPUT_LENGTH,
  nextActiveIndex,
  prevActiveIndex,
  suggestGames,
  type AutocompleteSuggestion,
} from "@/lib/daily/autocomplete";

type GuessAutocompleteProps = {
  id: string;
  value: string;
  disabled?: boolean;
  games: readonly GuessCatalogGame[];
  onChange: (value: string) => void;
  onActiveIndexChange?: (index: number) => void;
  onSelectSuggestion: (suggestion: AutocompleteSuggestion) => void;
  listOpen: boolean;
  onListOpenChange: (open: boolean) => void;
  activeIndex: number;
};

export function GuessAutocomplete({
  id,
  value,
  disabled = false,
  games,
  onChange,
  onActiveIndexChange,
  onSelectSuggestion,
  listOpen,
  onListOpenChange,
  activeIndex,
}: GuessAutocompleteProps) {
  const listId = useId();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);

  const suggestions = useMemo(
    () => suggestGames(value, games),
    [value, games],
  );

  const open = listOpen && !disabled && suggestions.length > 0;
  const active =
    open && activeIndex >= 0 && activeIndex < suggestions.length
      ? suggestions[activeIndex]
      : undefined;

  function setActive(index: number) {
    onActiveIndexChange?.(index);
  }

  function handleChange(next: string) {
    const clipped = next.slice(0, MAX_GUESS_INPUT_LENGTH);
    onChange(clipped);
    const nextSuggestions = suggestGames(clipped, games);
    if (nextSuggestions.length > 0) {
      onListOpenChange(true);
      setActive(0);
    } else {
      onListOpenChange(false);
      setActive(-1);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (suggestions.length === 0) return;
      onListOpenChange(true);
      setActive(nextActiveIndex(open ? activeIndex : -1, suggestions.length));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (suggestions.length === 0) return;
      onListOpenChange(true);
      setActive(prevActiveIndex(open ? activeIndex : -1, suggestions.length));
      return;
    }

    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        onListOpenChange(false);
        setActive(-1);
      }
      return;
    }

    if (event.key === "Enter" && open && active) {
      event.preventDefault();
      onSelectSuggestion(active);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        name="guess"
        type="text"
        role="combobox"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="send"
        placeholder="Type a game title"
        maxLength={MAX_GUESS_INPUT_LENGTH}
        value={value}
        disabled={disabled}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={active ? `${listId}-opt-${active.id}` : undefined}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (blurTimer.current) {
            clearTimeout(blurTimer.current);
            blurTimer.current = null;
          }
          if (suggestions.length > 0) {
            onListOpenChange(true);
            if (activeIndex < 0) setActive(0);
          }
        }}
        onBlur={() => {
          blurTimer.current = setTimeout(() => {
            onListOpenChange(false);
            blurTimer.current = null;
          }, 0);
        }}
        className="min-h-12 w-full rounded-xl border border-white/15 bg-[color:var(--surface)] px-4 text-base text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] placeholder:text-[color:var(--muted)] focus-visible:ring-2 disabled:opacity-60"
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Game suggestions"
          className="mt-2 max-h-48 overflow-y-auto overscroll-contain rounded-xl border border-white/15 bg-[color:var(--surface)] py-1"
        >
          {suggestions.map((suggestion, index) => {
            const selected = index === activeIndex;
            return (
              <li
                key={suggestion.id}
                id={`${listId}-opt-${suggestion.id}`}
                role="option"
                aria-selected={selected}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  className={`flex min-h-12 w-full flex-col justify-center px-4 py-2 text-left text-base outline-none ${
                    selected
                      ? "bg-white/10 text-[color:var(--foreground)]"
                      : "text-[color:var(--foreground)] hover:bg-white/5"
                  }`}
                  onMouseEnter={() => setActive(index)}
                  onPointerDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    onSelectSuggestion(suggestion);
                  }}
                >
                  <span className="font-medium">{suggestion.title}</span>
                  {suggestion.matchedAlias ? (
                    <span className="text-sm text-[color:var(--muted)]">
                      Also known as {suggestion.matchedAlias}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export type { AutocompleteSuggestion };
