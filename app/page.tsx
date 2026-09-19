import { DailyPlay } from "@/components/daily/DailyPlay";
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

      <noscript>
        <p className="mt-6 rounded-xl border border-white/10 bg-[color:var(--surface)] px-4 py-5 text-sm leading-6 text-[color:var(--muted)]">
          JavaScript is required to play today&apos;s ThemeShot. This page does
          not include the answer.
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
            Type a game title. English, Chinese, and Japanese names all count.
          </li>
          <li>A wrong guess or Skip reveals the next shot — up to six.</li>
          <li>You have six guesses. A new puzzle arrives at 00:00 UTC.</li>
        </ol>
      </section>
    </main>
  );
}
