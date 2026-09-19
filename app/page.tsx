import Link from "next/link";

import { DailyPlay } from "@/components/daily/DailyPlay";
import { ThemeBadge } from "@/components/themes/ThemeBadge";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {site.product}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
        Guess today&apos;s game
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)] sm:text-lg sm:leading-8">
        {site.tagline}
      </p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
        {site.resetNote} {site.playNote}
      </p>

      <ThemeBadge />

      <noscript>
        <p className="mt-6 rounded-xl border border-white/10 bg-[color:var(--surface)] px-4 py-5 text-sm leading-6 text-[color:var(--muted)]">
          JavaScript is required to play today&apos;s ThemeShot. This page does
          not include the answer. The current theme name, when a week is
          active, is still visible above.
        </p>
      </noscript>

      <div className="mt-8">
        <DailyPlay />
      </div>

      <section id="how-to-play" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
          How to play
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[color:var(--muted)] sm:text-base">
          <li>Look at today&apos;s screenshot.</li>
          <li>
            Type a game title. Catalog suggestions (English, Chinese, and
            Japanese names) appear as you type.
          </li>
          <li>A wrong guess or Skip reveals the next shot — up to six.</li>
          <li>You have six guesses. A new puzzle arrives at 00:00 UTC.</li>
          <li>Copy a spoiler-free result when you finish — no title in the share text.</li>
          <li>
            Open Stats for your local streak and guess distribution. Nothing is
            uploaded.
          </li>
          <li>
            Missed a day? Replay recent ThemeShots from the Archive. Historical
            puzzle pages are not indexed.
          </li>
        </ol>
        <p className="mt-4">
          <Link
            href="/archive"
            className="inline-flex min-h-11 items-center text-sm font-medium text-[color:var(--accent)] underline-offset-4 hover:underline"
          >
            Open the Archive
          </Link>
        </p>
      </section>
    </main>
  );
}
