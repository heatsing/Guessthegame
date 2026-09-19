"use client";

import { useState } from "react";

import type { PlayableScreenshot } from "@/lib/daily/load-puzzle";

type ScreenshotRevealProps = {
  screenshots: PlayableScreenshot[];
  revealedCount: number;
  finished: boolean;
};

export function ScreenshotReveal({
  screenshots,
  revealedCount,
  finished,
}: ScreenshotRevealProps) {
  const visible = screenshots.slice(0, Math.max(revealedCount, 0));
  const current = visible[visible.length - 1] ?? null;
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

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

  const failed = failedIds.has(current.id);
  const index = visible.length;
  const total = screenshots.length;

  return (
    <figure className="w-full">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-[color:var(--surface)]">
        {failed ? (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center"
            role="alert"
          >
            <p className="text-base font-medium text-[color:var(--foreground)]">
              Screenshot failed to load
            </p>
            <p className="text-sm text-[color:var(--muted)]">
              Check your connection, then refresh to try again.
            </p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.id}
            src={current.src}
            alt={`Screenshot ${index} of today's puzzle`}
            width={current.width}
            height={current.height}
            className="h-full w-full object-cover"
            decoding="async"
            onError={() =>
              setFailedIds((prev) => {
                const next = new Set(prev);
                next.add(current.id);
                return next;
              })
            }
          />
        )}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[color:var(--muted)]">
        <span>
          Screenshot {index} of {total}
          {finished ? " · all revealed" : null}
        </span>
        <ol className="flex gap-1.5" aria-hidden="true">
          {screenshots.map((shot, shotIndex) => {
            const on = shotIndex < revealedCount;
            return (
              <li
                key={shot.id}
                className={`h-2 w-2 rounded-full ${
                  on
                    ? "bg-[color:var(--accent)]"
                    : "bg-white/20"
                }`}
              />
            );
          })}
        </ol>
      </figcaption>
    </figure>
  );
}
