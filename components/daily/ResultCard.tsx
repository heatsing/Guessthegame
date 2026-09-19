import { ViewStatsButton } from "@/components/stats/StatsEntry";
import type { DailyAnswer } from "@/lib/daily/load-puzzle";
import type { PlayState } from "@/lib/daily/play";

import { ShareResults } from "./ShareResults";

type ResultCardProps = {
  play: PlayState;
  answer: DailyAnswer;
};

export function ResultCard({ play, answer }: ResultCardProps) {
  const won = play.status === "won";
  const guessCount = play.guesses.length;

  return (
    <section
      className="rounded-xl border border-white/10 bg-[color:var(--surface)] p-4 sm:p-5"
      aria-live="polite"
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)]">
        {won ? "Solved" : "Out of guesses"}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
        {answer.title}
      </h2>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        {won
          ? `You got it in ${guessCount} ${guessCount === 1 ? "guess" : "guesses"}.`
          : "Better luck on tomorrow's ThemeShot."}
      </p>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-[color:var(--muted)]">Released</dt>
          <dd className="font-medium text-[color:var(--foreground)]">
            {answer.releaseYear}
          </dd>
        </div>
        <div>
          <dt className="text-[color:var(--muted)]">Platforms</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {answer.platforms.map((platform) => (
              <span
                key={platform}
                className="rounded-full border border-white/15 px-2.5 py-1 text-[color:var(--foreground)]"
              >
                {platform}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      {answer.storeUrl ? (
        <p className="mt-4">
          <a
            href={answer.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center text-sm font-semibold text-[color:var(--accent)] underline-offset-4 hover:underline"
          >
            {answer.storeLabel ?? "Store page"}
          </a>
        </p>
      ) : null}
      <ShareResults play={play} />
      <ViewStatsButton />
    </section>
  );
}
