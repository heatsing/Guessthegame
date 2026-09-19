"use client";

import { useState } from "react";

import type { PlayableScreenshot } from "@/lib/daily/load-puzzle";

type ScreenshotRevealProps = {
  screenshots: PlayableScreenshot[];
  revealedCount: number;
  finished: boolean;
};

function ShotFrame({
  shot,
  label,
  className,
}: {
  shot: PlayableScreenshot;
  label: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [nonce, setNonce] = useState(0);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-[color:var(--surface)] ${className ?? ""}`}
    >
      {failed ? (
        <div
          className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-3 px-6 py-8 text-center"
          role="alert"
        >
          <p className="text-base font-medium text-[color:var(--foreground)]">
            Screenshot failed to load
          </p>
          <p className="text-sm text-[color:var(--muted)]">
            Check your connection, then try again.
          </p>
          <button
            type="button"
            className="min-h-11 rounded-xl border border-white/20 px-4 text-sm font-semibold text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus-visible:ring-2"
            onClick={() => {
              setFailed(false);
              setNonce((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${shot.id}-${nonce}`}
          src={shot.src}
          alt={label}
          width={shot.width}
          height={shot.height}
          className="h-full w-full object-cover"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function ScreenshotReveal({
  screenshots,
  revealedCount,
  finished,
}: ScreenshotRevealProps) {
  const visible = screenshots.slice(0, Math.max(revealedCount, 0));
  const current = visible[visible.length - 1] ?? null;
  const total = screenshots.length;

  if (!current) {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center rounded-xl border border-white/10 bg-[color:var(--surface)] px-4 text-center text-sm text-[color:var(--muted)]"
        role="status"
      >
        No screenshot is available for this slot.
      </div>
    );
  }

  return (
    <figure className="w-full">
      {finished && visible.length > 1 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visible.map((shot, index) => (
            <ShotFrame
              key={shot.id}
              shot={shot}
              label={`Screenshot ${index + 1} of today's puzzle`}
              className="aspect-video"
            />
          ))}
        </div>
      ) : (
        <ShotFrame
          shot={current}
          label={`Screenshot ${visible.length} of today's puzzle`}
          className="aspect-video w-full"
        />
      )}
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[color:var(--muted)]">
        <span>
          {finished
            ? `All ${total} screenshots revealed`
            : `Screenshot ${visible.length} of ${total}`}
        </span>
        <ol className="flex gap-1.5" aria-hidden="true">
          {screenshots.map((shot, shotIndex) => (
            <li
              key={shot.id}
              className={`h-2 w-2 rounded-full ${
                shotIndex < revealedCount
                  ? "bg-[color:var(--accent)]"
                  : "bg-white/20"
              }`}
            />
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
