import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { repoLicensePath } from "./media-path";
import type { Catalog } from "./schema";
import type { CatalogIssue } from "./validate";

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function toPublicPath(storageUrl: string, repoRoot: string): string | null {
  if (!storageUrl.startsWith("/media/")) return null;
  return join(repoRoot, "public", storageUrl.replace(/^\//, ""));
}

/** Confirm self-hosted `/media/…` files exist and match `checksum`. */
export function validateLocalMediaFiles(
  catalog: Catalog,
  repoRoot = process.cwd(),
): CatalogIssue[] {
  const issues: CatalogIssue[] = [];

  const urls: Array<{ path: string; url: string; skipMissing: boolean }> = [
    ...catalog.media_assets.map((asset) => ({
      path: `media_assets.${asset.id}.storage_url`,
      url: asset.storage_url,
      skipMissing: asset.moderation_status === "takedown",
    })),
    ...catalog.themes.map((theme) => ({
      path: `themes.${theme.id}.hero_image`,
      url: theme.hero_image,
      skipMissing: false,
    })),
  ];

  for (const item of urls) {
    if (item.skipMissing) continue;
    const filePath = toPublicPath(item.url, repoRoot);
    if (!filePath) continue;
    if (!existsSync(filePath)) {
      issues.push({
        path: item.path,
        message: `local media file missing at public${item.url}`,
      });
    }
  }

  for (const asset of catalog.media_assets) {
    if (asset.moderation_status === "takedown") continue;
    const filePath = toPublicPath(asset.storage_url, repoRoot);
    if (!filePath || !existsSync(filePath)) continue;
    const digest = sha256File(filePath);
    if (digest !== asset.checksum) {
      issues.push({
        path: `media_assets.${asset.id}.checksum`,
        message: `checksum mismatch for ${asset.storage_url} (file=${digest})`,
      });
    }
  }

  return issues;
}

/** Repo-relative `license_doc_url` values must exist on disk. */
export function validateLicenseArchives(
  catalog: Catalog,
  repoRoot = process.cwd(),
): CatalogIssue[] {
  const issues: CatalogIssue[] = [];

  for (const asset of catalog.media_assets) {
    if (asset.rights_status === "unknown") continue;
    const relative = repoLicensePath(asset.license_doc_url);
    if (!relative) continue;
    const filePath = join(repoRoot, relative);
    if (!existsSync(filePath)) {
      issues.push({
        path: `media_assets.${asset.id}.license_doc_url`,
        message: `license archive missing at ${relative}`,
      });
    }
  }

  return issues;
}
