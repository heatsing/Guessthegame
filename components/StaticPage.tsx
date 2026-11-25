import Link from "next/link";
import type { ReactNode } from "react";

import { formatLegalUpdated } from "@/lib/legal/dates";
import { footerNav, type LegalHref } from "@/lib/legal/nav";
import { Brand } from "./Brand";

type StaticPageProps = {
  path: LegalHref;
  title: string;
  lead: string;
  children: ReactNode;
  updated?: boolean;
};

export function StaticPage({
  path,
  title,
  lead,
  children,
  updated = true,
}: StaticPageProps) {
  return (
    <div className="flex flex-1 flex-col bg-[#fcfcfb] text-[color:var(--foreground)]">
      <header className="border-b border-[#dce1e8]">
        <nav
          aria-label="Site"
          className="mx-auto flex min-h-16 w-full max-w-5xl flex-wrap items-center justify-between gap-x-5 px-5 sm:px-8"
        >
          <Brand className="inline-flex min-h-11 items-center gap-2 text-lg font-bold tracking-tight" />
          <Link href="/#games" className="inline-flex min-h-11 items-center hover:underline">
            All games
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[color:var(--muted)]">{lead}</p>
        <article className="static-copy mt-8">{children}</article>
        {updated && (
          <p className="mt-10 text-sm leading-6 text-[color:var(--muted)]">
            Last updated {formatLegalUpdated()}.
          </p>
        )}
      </main>

      <footer className="border-t border-[#dce1e8]">
        <nav aria-label="Site information" className="mx-auto w-full max-w-5xl px-5 py-3 sm:px-8">
          <ul className="flex flex-wrap gap-x-5">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={item.href === path ? "page" : undefined}
                  className="inline-flex min-h-11 items-center text-sm text-[color:var(--muted)] underline-offset-4 hover:underline aria-[current=page]:font-semibold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </div>
  );
}
