import type { Metadata } from "next";

import { site } from "@/lib/site";

export function pageMetadata(
  path: string,
  title: string,
  description: string,
): Metadata {
  const fullTitle = `${title} — ${site.name}`;
  return {
    title: fullTitle,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: site.name,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}
