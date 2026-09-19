import Link from "next/link";

import { footerNav } from "@/lib/legal/nav";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[color:var(--surface)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 text-sm text-[color:var(--muted)] sm:px-6">
        <p>{site.disclaimer}</p>
        <p>
          <span className="font-medium text-[color:var(--foreground)]">
            Attribution
          </span>
          <span className="mt-1 block">
            Game metadata may include data from{" "}
            <a
              href={site.rawg.url}
              rel="noopener noreferrer"
              className="text-[color:var(--accent)] underline-offset-4 hover:underline"
            >
              {site.rawg.name}
            </a>
            . {site.rawg.name} does not grant screenshot or artwork rights.
            ThemeShot images are self-hosted with recorded rights.
          </span>
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
        >
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
