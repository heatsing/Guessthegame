import Link from "next/link";
import type { ReactNode } from "react";

import { formatLegalUpdated } from "@/lib/legal/dates";
import { legalNav, type LegalHref } from "@/lib/legal/nav";
import { site } from "@/lib/site";

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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {site.product}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)] sm:text-lg sm:leading-8">
        {lead}
      </p>
      <article className="static-copy mt-8">{children}</article>
      {updated ? (
        <p className="mt-10 text-xs leading-5 text-[color:var(--muted)]">
          Last updated {formatLegalUpdated()}. These pages are standard
          templates and have not been reviewed by counsel.
        </p>
      ) : null}
      <nav
        aria-label="Related pages"
        className="mt-8 border-t border-white/10 pt-6"
      >
        <p className="text-sm font-medium text-[color:var(--foreground)]">
          Also on this site
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {legalNav
            .filter((item) => item.href !== path)
            .map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-sm text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </main>
  );
}
