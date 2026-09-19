import Link from "next/link";

import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-white/10 bg-[color:var(--surface)]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="min-w-0 no-underline">
          <span className="block truncate text-sm font-semibold tracking-tight text-[color:var(--foreground)]">
            {site.name}
          </span>
          <span className="block text-xs uppercase tracking-[0.18em] text-[color:var(--accent)]">
            {site.product}
          </span>
        </Link>
        <Link
          href="/#how-to-play"
          className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
        >
          How to play
        </Link>
      </div>
    </header>
  );
}
