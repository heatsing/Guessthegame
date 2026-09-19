import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {site.product}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
        {site.name}
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-[color:var(--muted)]">
        {site.tagline}
      </p>
      <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)]">
        {site.resetNote} {site.comingSoon}
      </p>
    </main>
  );
}
