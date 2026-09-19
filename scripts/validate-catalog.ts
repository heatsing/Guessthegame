import { loadAndValidateCatalog } from "../lib/catalog/load";
import {
  validateLicenseArchives,
  validateLocalMediaFiles,
} from "../lib/catalog/local-media";
import { formatIssues } from "../lib/catalog/validate";

function main(): void {
  const result = loadAndValidateCatalog();

  if (!result.ok || !result.catalog) {
    console.error("Catalog validation failed:\n" + formatIssues(result.issues));
    process.exit(1);
  }

  const localIssues = [
    ...validateLocalMediaFiles(result.catalog),
    ...validateLicenseArchives(result.catalog),
  ];
  if (localIssues.length > 0) {
    console.error(
      "Catalog validation failed (local media / license archive):\n" +
        formatIssues(localIssues),
    );
    process.exit(1);
  }

  const { games, daily_puzzles, media_assets, themes, game_sources } =
    result.catalog;
  console.log(
    `Catalog OK — ${games.length} games, ${game_sources.length} sources, ${media_assets.length} assets, ${daily_puzzles.length} puzzles, ${themes.length} themes.`,
  );
}

main();
