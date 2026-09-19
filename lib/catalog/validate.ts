import { mediaStoragePathIssue } from "./media-path";
import { CatalogSchema, type Catalog, type MediaAsset } from "./schema";
import { isSteamCdnUrl } from "./steam";

export type CatalogIssue = {
  path: string;
  message: string;
};

export type CatalogValidationResult =
  | { ok: true; catalog: Catalog; issues: [] }
  | { ok: false; catalog: Catalog | null; issues: CatalogIssue[] };

const PUBLISHABLE_PUZZLE_STATUSES = new Set(["scheduled", "published"]);

function issue(path: string, message: string): CatalogIssue {
  return { path, message };
}

function uniqueOrDupes(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) dupes.push(id);
    else seen.add(id);
  }
  return dupes;
}

function assertNoSteamCdn(
  issues: CatalogIssue[],
  path: string,
  url: string,
): void {
  if (isSteamCdnUrl(url)) {
    issues.push(
      issue(
        path,
        `Steam CDN URL is forbidden as media storage (got ${url}). Host screenshots yourself.`,
      ),
    );
  }
}

function rightsBlockPublishable(asset: MediaAsset): boolean {
  return asset.rights_status === "unknown";
}

/**
 * Business rules on top of the Zod shape:
 * - No Steam CDN on media `storage_url` or theme `hero_image`
 * - Approved assets cannot use a Steam CDN URL
 * - `unknown` rights cannot be `can_monetize`
 * - `unknown` rights cannot be `approved` (publishable)
 * - Known-rights rows need licensor / license_doc_url / attribution_text
 * - storage_url follows /media/placeholders/… or /media/{slug}/{id}.{ext}
 * - scheduled/published puzzles may only reference approved, known-rights assets
 * - scheduled/published puzzles cannot use `nsfw_flag: true` games
 * - Referential integrity + unique ids / puzzle dates
 * - Theme descriptions are unique; UTC windows do not overlap
 */
export function validateCatalog(input: unknown): CatalogValidationResult {
  const parsed = CatalogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      catalog: null,
      issues: parsed.error.issues.map((item) =>
        issue(item.path.join(".") || "(root)", item.message),
      ),
    };
  }

  const catalog = parsed.data;
  const issues: CatalogIssue[] = [];

  const gamesById = new Map(catalog.games.map((game) => [game.id, game]));
  const assetsById = new Map(
    catalog.media_assets.map((asset) => [asset.id, asset]),
  );
  const themesById = new Map(catalog.themes.map((theme) => [theme.id, theme]));

  for (const dupe of uniqueOrDupes(catalog.games.map((g) => g.id))) {
    issues.push(issue(`games.${dupe}`, `duplicate game id "${dupe}"`));
  }
  for (const dupe of uniqueOrDupes(catalog.games.map((g) => g.slug))) {
    issues.push(issue("games", `duplicate game slug "${dupe}"`));
  }
  for (const dupe of uniqueOrDupes(catalog.game_sources.map((s) => s.id))) {
    issues.push(issue(`game_sources.${dupe}`, `duplicate game_source id "${dupe}"`));
  }
  for (const dupe of uniqueOrDupes(catalog.media_assets.map((a) => a.id))) {
    issues.push(issue(`media_assets.${dupe}`, `duplicate media_asset id "${dupe}"`));
  }
  for (const dupe of uniqueOrDupes(catalog.themes.map((t) => t.id))) {
    issues.push(issue(`themes.${dupe}`, `duplicate theme id "${dupe}"`));
  }
  for (const dupe of uniqueOrDupes(catalog.themes.map((t) => t.slug))) {
    issues.push(issue("themes", `duplicate theme slug "${dupe}"`));
  }
  for (const dupe of uniqueOrDupes(catalog.daily_puzzles.map((p) => p.id))) {
    issues.push(issue(`daily_puzzles.${dupe}`, `duplicate daily_puzzle id "${dupe}"`));
  }
  for (const dupe of uniqueOrDupes(
    catalog.daily_puzzles.map((p) => p.puzzle_date),
  )) {
    issues.push(issue("daily_puzzles", `duplicate puzzle_date "${dupe}"`));
  }

  for (const source of catalog.game_sources) {
    if (!gamesById.has(source.game_id)) {
      issues.push(
        issue(
          `game_sources.${source.id}.game_id`,
          `unknown game_id "${source.game_id}"`,
        ),
      );
    }
  }

  for (const asset of catalog.media_assets) {
    const path = `media_assets.${asset.id}`;
    if (!gamesById.has(asset.game_id)) {
      issues.push(issue(`${path}.game_id`, `unknown game_id "${asset.game_id}"`));
    }

    assertNoSteamCdn(issues, `${path}.storage_url`, asset.storage_url);

    if (asset.moderation_status === "approved" && isSteamCdnUrl(asset.storage_url)) {
      issues.push(
        issue(
          `${path}.storage_url`,
          "approved assets cannot use a Steam CDN URL",
        ),
      );
    }

    const game = gamesById.get(asset.game_id);
    if (
      game &&
      asset.moderation_status !== "takedown" &&
      !isSteamCdnUrl(asset.storage_url)
    ) {
      const pathIssue = mediaStoragePathIssue(
        asset.storage_url,
        game.slug,
        asset.id,
      );
      if (pathIssue) {
        issues.push(issue(`${path}.storage_url`, pathIssue));
      }
    }

    if (asset.rights_status === "unknown" && asset.can_monetize) {
      issues.push(
        issue(
          `${path}.can_monetize`,
          "unknown rights cannot be marked can_monetize",
        ),
      );
    }

    if (asset.moderation_status === "takedown" && asset.can_monetize) {
      issues.push(
        issue(`${path}.can_monetize`, "takedown assets cannot be marked can_monetize"),
      );
    }

    if (asset.rights_status !== "unknown") {
      if (!asset.licensor.trim()) {
        issues.push(
          issue(`${path}.licensor`, "known rights require a non-empty licensor"),
        );
      }
      if (!asset.license_doc_url.trim()) {
        issues.push(
          issue(
            `${path}.license_doc_url`,
            "known rights require a license archive path or URL",
          ),
        );
      }
      if (!asset.attribution_text.trim()) {
        issues.push(
          issue(
            `${path}.attribution_text`,
            "known rights require attribution_text",
          ),
        );
      }
    }

    if (rightsBlockPublishable(asset) && asset.moderation_status === "approved") {
      issues.push(
        issue(
          `${path}.moderation_status`,
          "unknown rights cannot enter publishable (approved) status",
        ),
      );
    }

    if (asset.moderation_status === "takedown") {
      if (!asset.takedown_at || !asset.takedown_reason) {
        issues.push(
          issue(
            path,
            "takedown assets require takedown_at and takedown_reason",
          ),
        );
      }
    }
  }

  const descriptionKeys = new Map<string, string>();
  for (const theme of catalog.themes) {
    const path = `themes.${theme.id}`;
    assertNoSteamCdn(issues, `${path}.hero_image`, theme.hero_image);
    if (theme.end_date < theme.start_date) {
      issues.push(issue(`${path}.end_date`, "end_date must be on or after start_date"));
    }
    const descKey = theme.description.trim().toLowerCase();
    const previousId = descriptionKeys.get(descKey);
    if (previousId) {
      issues.push(
        issue(
          `${path}.description`,
          `duplicate theme description (same as "${previousId}"); empty-shell copies are forbidden`,
        ),
      );
    } else {
      descriptionKeys.set(descKey, theme.id);
    }
  }

  for (let i = 0; i < catalog.themes.length; i += 1) {
    const left = catalog.themes[i]!;
    for (let j = i + 1; j < catalog.themes.length; j += 1) {
      const right = catalog.themes[j]!;
      const overlaps =
        left.start_date <= right.end_date && right.start_date <= left.end_date;
      if (overlaps) {
        issues.push(
          issue(
            `themes.${left.id}`,
            `UTC window overlaps "${right.id}" (${left.start_date}–${left.end_date} vs ${right.start_date}–${right.end_date})`,
          ),
        );
      }
    }
  }

  for (const puzzle of catalog.daily_puzzles) {
    const path = `daily_puzzles.${puzzle.id}`;
    const game = gamesById.get(puzzle.game_id);
    if (!game) {
      issues.push(issue(`${path}.game_id`, `unknown game_id "${puzzle.game_id}"`));
    } else if (
      PUBLISHABLE_PUZZLE_STATUSES.has(puzzle.status) &&
      game.status !== "active"
    ) {
      issues.push(
        issue(
          `${path}.game_id`,
          `publishable puzzle cannot use hidden game "${puzzle.game_id}"`,
        ),
      );
    } else if (
      PUBLISHABLE_PUZZLE_STATUSES.has(puzzle.status) &&
      game.nsfw_flag
    ) {
      issues.push(
        issue(
          `${path}.game_id`,
          `publishable puzzle cannot use NSFW-flagged game "${puzzle.game_id}"`,
        ),
      );
    }

    if (puzzle.theme_id && !themesById.has(puzzle.theme_id)) {
      issues.push(
        issue(`${path}.theme_id`, `unknown theme_id "${puzzle.theme_id}"`),
      );
    }

    const seenAssets = new Set<string>();
    for (const [index, assetId] of puzzle.asset_ids.entries()) {
      if (seenAssets.has(assetId)) {
        issues.push(
          issue(`${path}.asset_ids.${index}`, `duplicate asset_id "${assetId}"`),
        );
        continue;
      }
      seenAssets.add(assetId);

      const asset = assetsById.get(assetId);
      if (!asset) {
        issues.push(
          issue(`${path}.asset_ids.${index}`, `unknown asset_id "${assetId}"`),
        );
        continue;
      }

      if (asset.game_id !== puzzle.game_id) {
        issues.push(
          issue(
            `${path}.asset_ids.${index}`,
            `asset "${assetId}" belongs to ${asset.game_id}, not ${puzzle.game_id}`,
          ),
        );
      }

      if (!PUBLISHABLE_PUZZLE_STATUSES.has(puzzle.status)) continue;

      if (asset.moderation_status !== "approved") {
        issues.push(
          issue(
            `${path}.asset_ids.${index}`,
            `publishable puzzle cannot use ${asset.moderation_status} asset "${assetId}"`,
          ),
        );
      }

      if (rightsBlockPublishable(asset)) {
        issues.push(
          issue(
            `${path}.asset_ids.${index}`,
            `unknown rights cannot enter a ${puzzle.status} puzzle`,
          ),
        );
      }
    }
  }

  if (issues.length > 0) {
    return { ok: false, catalog, issues };
  }
  return { ok: true, catalog, issues: [] };
}

export function formatIssues(issues: CatalogIssue[]): string {
  return issues.map((item) => `- ${item.path}: ${item.message}`).join("\n");
}
