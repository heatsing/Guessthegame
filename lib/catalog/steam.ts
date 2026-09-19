/** Host suffixes known to serve Steam store / screenshot CDN assets. */
const STEAM_CDN_HOST_SUFFIXES = [
  "steamstatic.com",
  "steamusercontent.com",
  "steamcdn-a.akamaihd.net",
  "media.steampowered.com",
  "cdn.steampowered.com",
] as const;

function hostnameMatchesSteamCdn(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return STEAM_CDN_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

/**
 * True when `value` is an absolute, protocol-relative, or raw URL that points
 * at a Steam CDN host. Relative self-hosted paths (e.g. `/media/…`) are fine.
 */
export function isSteamCdnUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const candidate = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  try {
    if (candidate.includes("://")) {
      const url = new URL(candidate);
      if (hostnameMatchesSteamCdn(url.hostname)) return true;
    }
  } catch {
    // Fall through to substring check for malformed URLs.
  }

  const lower = trimmed.toLowerCase();
  return STEAM_CDN_HOST_SUFFIXES.some((suffix) => lower.includes(suffix));
}

export { STEAM_CDN_HOST_SUFFIXES };
