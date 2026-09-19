"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { isFinished, type PlayState } from "@/lib/daily/play";
import {
  buildShareText,
  canUseWebShare,
  copyTextToClipboard,
} from "@/lib/daily/share";

type ShareResultsProps = {
  play: PlayState;
};

type CopyStatus = "idle" | "copied" | "error";

function subscribeNever() {
  return () => {};
}

export function ShareResults({ play }: ShareResultsProps) {
  const text = useMemo(() => buildShareText(play), [play]);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const webShare = useSyncExternalStore(
    subscribeNever,
    () => canUseWebShare(text),
    () => false,
  );

  useEffect(() => {
    if (copyStatus !== "copied") return;
    const timeout = window.setTimeout(() => setCopyStatus("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  if (!isFinished(play.status)) return null;

  async function handleCopy() {
    const ok = await copyTextToClipboard(text);
    setCopyStatus(ok ? "copied" : "error");
  }

  async function handleShare() {
    try {
      await navigator.share({ text });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await handleCopy();
    }
  }

  const copyLabel = copyStatus === "copied" ? "Copied" : "Copy";

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)]">
        Share result
      </p>
      <pre
        className="mt-3 overflow-x-auto rounded-lg bg-black/30 px-3 py-3 font-mono text-sm leading-6 whitespace-pre-wrap text-[color:var(--foreground)]"
        aria-label="Spoiler-free share text"
      >
        {text}
      </pre>
      <div className={`mt-3 grid gap-3 ${webShare ? "grid-cols-2" : "grid-cols-1"}`}>
        {webShare ? (
          <button
            type="button"
            onClick={() => void handleShare()}
            className="min-h-12 rounded-xl bg-[color:var(--accent)] px-4 text-base font-semibold text-[#1a1408] outline-none ring-[color:var(--accent)] focus-visible:ring-2"
          >
            Share
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={copyStatus === "copied" ? "Copied to clipboard" : "Copy share text"}
          data-copy-status={copyStatus}
          className={
            webShare
              ? "min-h-12 rounded-xl border border-white/20 bg-transparent px-4 text-base font-semibold text-[color:var(--foreground)] outline-none ring-[color:var(--accent)] focus-visible:ring-2"
              : "min-h-12 rounded-xl bg-[color:var(--accent)] px-4 text-base font-semibold text-[#1a1408] outline-none ring-[color:var(--accent)] focus-visible:ring-2"
          }
        >
          {copyLabel}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copyStatus === "copied"
          ? "Copied to clipboard"
          : copyStatus === "error"
            ? "Could not copy. Select the share text instead."
            : ""}
      </p>
      {copyStatus === "copied" ? (
        <p className="mt-2 text-sm text-[color:var(--accent)]" role="status">
          Copied to clipboard.
        </p>
      ) : null}
      {copyStatus === "error" ? (
        <p className="mt-2 text-sm text-red-300" role="status">
          Could not copy. Select the share text above instead.
        </p>
      ) : null}
    </div>
  );
}
