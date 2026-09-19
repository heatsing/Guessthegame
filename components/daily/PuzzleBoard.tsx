"use client";

import type { DailyApiOk } from "@/lib/daily/api-types";
import { MAX_GUESSES } from "@/lib/daily/constants";
import { formatPuzzleDate } from "@/lib/daily/date";
import { isFinished, remainingGuesses, revealedScreenshotCount, type PlayState } from "@/lib/daily/play";

import { GuessInput } from "./GuessInput";
import { ResultCard } from "./ResultCard";
import { ScreenshotReveal } from "./ScreenshotReveal";

type PuzzleBoardProps = {
  daily: DailyApiOk;
  play: PlayState;
  onGuess: (value: string) => void;
  onSkip: () => void;
};

export function PuzzleBoard({ daily, play, onGuess, onSkip }: PuzzleBoardProps) {
  const finished = isFinished(play.status);
  const revealed = revealedScreenshotCount(play, daily.screenshots.length);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-[color:var(--muted)]">
          Puzzle for {formatPuzzleDate(daily.date)} · resets 00:00 UTC
        </p>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          {finished
            ? play.status === "won"
              ? `Solved in ${play.guesses.length} of ${MAX_GUESSES}`
              : `No guesses left · ${MAX_GUESSES} of ${MAX_GUESSES} used`
            : `${remainingGuesses(play)} of ${MAX_GUESSES} guesses left`}
        </p>
      </div>

      <ScreenshotReveal
        screenshots={daily.screenshots}
        revealedCount={revealed}
        finished={finished}
      />

      {play.guesses.length > 0 ? (
        <ol className="flex flex-col gap-2" aria-label="Your guesses">
          {play.guesses.map((guess, index) => (
            <li
              key={`${guess.kind}-${index}-${guess.text}`}
              className={`rounded-lg border px-3 py-2 text-sm ${
                guess.correct
                  ? "border-[color:var(--accent)]/40 text-[color:var(--accent)]"
                  : "border-white/10 text-[color:var(--muted)]"
              }`}
            >
              <span className="mr-2 font-mono text-xs text-white/40">
                {index + 1}
              </span>
              {guess.kind === "skip" ? "Skipped" : guess.text}
            </li>
          ))}
        </ol>
      ) : null}

      {finished && (play.status === "won" || play.status === "lost") ? (
        <ResultCard play={play} answer={daily.answer} />
      ) : (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-white/10 bg-[color:var(--background)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mx-6 sm:px-6">
          <GuessInput
            guessNumber={play.guesses.length + 1}
            maxGuesses={MAX_GUESSES}
            games={daily.games}
            onGuess={onGuess}
            onSkip={onSkip}
          />
        </div>
      )}
    </section>
  );
}
