export const MAX_GUESSES = 6;
export const MAX_SCREENSHOTS = 6;

/** Newest-first cap for `/archive` (published, already-open UTC dates only). */
export const ARCHIVE_LIMIT = 30;

/** Browser localStorage key. Schema version lives in the JSON `version` field. */
export const DAILY_STORAGE_KEY = "themeshot.daily.v1";

/** Current `themeshot.daily.v1` JSON document version (v1 days-only files migrate on read). */
export const DAILY_FILE_VERSION = 2;
