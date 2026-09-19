import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { formatPuzzleDate, getDailyPuzzleDate } from "@/lib/daily/date";
import { pageMetadata } from "@/lib/seo";
import { getThemeBySlug, getThemePageCopy } from "@/lib/themes";

export const dynamicParams = false;

export function generateStaticParams() {
  return loadBundledCatalog().themes.map((theme) => ({ slug: theme.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/themes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const theme = getThemeBySlug(loadBundledCatalog().themes, slug);
  if (!theme) notFound();

  return pageMetadata(
    `/themes/${theme.slug}`,
    `${theme.title} — Theme Week`,
    theme.description,
  );
}

export default async function ThemePage({
  params,
}: PageProps<"/themes/[slug]">) {
  await connection();
  const { slug } = await params;
  const today = getDailyPuzzleDate();
  const copy = getThemePageCopy(loadBundledCatalog(), slug, today);
  if (!copy) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
        {copy.isCurrent ? "Current theme week" : "Theme week"}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
        {copy.title}
      </h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{copy.rangeLabel}</p>

      {/* Unique, SSR copy — readable with JavaScript disabled. No answers. */}
      <p className="mt-6 max-w-xl text-base leading-7 text-[color:var(--muted)]">
        {copy.description}
      </p>
      <p className="mt-4 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
        This ThemeShot week runs {copy.rangeLabel}. Play each day from the
        homepage. This page never lists titles, covers, or solutions.
      </p>

      {copy.heroImage ? (
        <Image
          src={copy.heroImage}
          alt=""
          width={1280}
          height={720}
          className="mt-8 h-auto w-full rounded-xl border border-white/10"
          unoptimized
        />
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
          Published puzzles
        </h2>
        {copy.publishedDates.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            No puzzles from this theme have been published yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {copy.publishedDates.map((date) => (
              <li key={date}>
                <Link
                  href={`/puzzle/${date}`}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-[color:var(--accent)] no-underline hover:underline"
                >
                  <time dateTime={date}>{formatPuzzleDate(date)}</time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav
        className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm"
        aria-label="Theme week links"
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-medium text-[color:var(--accent)] no-underline hover:underline"
        >
          Play today&apos;s puzzle
        </Link>
        <Link
          href="/archive"
          className="inline-flex min-h-11 items-center font-medium text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
        >
          Archive
        </Link>
        <Link
          href="/themes"
          className="inline-flex min-h-11 items-center font-medium text-[color:var(--muted)] no-underline hover:text-[color:var(--foreground)]"
        >
          All theme weeks
        </Link>
      </nav>
    </main>
  );
}
