import type { MetadataRoute } from "next";

import { loadBundledCatalog } from "@/lib/catalog/bundled";
import { getDailyPuzzleDate } from "@/lib/daily/date";
import { buildSitemapEntries } from "@/lib/seo";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(
    loadBundledCatalog().themes,
    site.url,
    getDailyPuzzleDate(),
  );
}
