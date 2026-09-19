import { isSteamCdnUrl } from "./steam";

/** Git-managed stills served by Next.js from `public/`. */
export const LOCAL_MEDIA_ROOT = "public/media";

/** Repo-relative written-permission / press-kit archive. */
export const LICENSE_ARCHIVE_ROOT = "data/licenses";

/** Non-public quarantine for files removed by the takedown script. */
export const TAKEDOWN_QUARANTINE_ROOT = "data/takedown";

/**
 * Object-storage key prefix that mirrors the public URL path.
 * Example: `s3://guessthegame-media/prod/media/{game-slug}/{asset-id}.webp`
 * Public URL: `https://media.guessthegame.net/media/{game-slug}/{asset-id}.webp`
 */
export const OBJECT_STORAGE_KEY_PREFIX = "media/";

export const PLACEHOLDER_MEDIA_PREFIX = "/media/placeholders/";

const MEDIA_FILE_EXT = /\.(webp|jpe?g|png|svg)$/i;

function pathnameFromStorageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed.split("?")[0] ?? trimmed;

  const candidate = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  try {
    if (candidate.includes("://")) {
      return new URL(candidate).pathname;
    }
  } catch {
    return null;
  }
  return null;
}

/** Canonical self-hosted path: `/media/{game-slug}/{asset-id}.{ext}`. */
export function canonicalMediaPath(
  gameSlug: string,
  assetId: string,
  ext: string,
): string {
  const cleanExt = ext.replace(/^\./, "").toLowerCase();
  return `/media/${gameSlug}/${assetId}.${cleanExt}`;
}

export function isPlaceholderMediaPath(path: string): boolean {
  return path.startsWith(PLACEHOLDER_MEDIA_PREFIX);
}

export function isCanonicalMediaPath(
  path: string,
  gameSlug: string,
  assetId: string,
): boolean {
  const expectedPrefix = `/media/${gameSlug}/${assetId}.`;
  if (!path.startsWith(expectedPrefix)) return false;
  const rest = path.slice(expectedPrefix.length);
  return MEDIA_FILE_EXT.test(`.${rest}`) && !rest.includes("/") && !rest.includes("..");
}

export function isTakedownQuarantinePath(value: string): boolean {
  return (
    value.startsWith(`${TAKEDOWN_QUARANTINE_ROOT}/`) ||
    value.startsWith(`/${TAKEDOWN_QUARANTINE_ROOT}/`)
  );
}

/**
 * `null` when the URL is an allowed self-hosted (or documented object-storage)
 * path. Otherwise a validator message.
 */
export function mediaStoragePathIssue(
  storageUrl: string,
  gameSlug: string,
  assetId: string,
): string | null {
  if (isSteamCdnUrl(storageUrl)) {
    return `Steam CDN URL is forbidden as media storage (got ${storageUrl}). Host screenshots yourself.`;
  }

  if (isTakedownQuarantinePath(storageUrl)) {
    return null;
  }

  const path = pathnameFromStorageUrl(storageUrl);
  if (!path) {
    return `storage_url must be /media/placeholders/… or /media/${gameSlug}/${assetId}.{ext} (got ${storageUrl})`;
  }

  if (isPlaceholderMediaPath(path)) {
    return null;
  }

  if (isCanonicalMediaPath(path, gameSlug, assetId)) {
    return null;
  }

  return `storage_url must be ${PLACEHOLDER_MEDIA_PREFIX}… or ${canonicalMediaPath(gameSlug, assetId, "webp")} (or the same path on a non-Steam origin). Object-storage keys use ${OBJECT_STORAGE_KEY_PREFIX}{game-slug}/{asset-id}.{ext}.`;
}

/** Repo-relative license archive path, or null when the URL is remote. */
export function repoLicensePath(licenseDocUrl: string): string | null {
  const trimmed = licenseDocUrl.trim();
  if (!trimmed) return null;
  if (trimmed.includes("://") || trimmed.startsWith("//")) return null;
  return trimmed.replace(/^\//, "");
}
