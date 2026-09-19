import { loadBundledCatalog } from "../lib/catalog/bundled";
import { guessCatalogFromGames } from "../lib/catalog/guess-index";
import {
  MAX_GUESS_INPUT_LENGTH,
  nextActiveIndex,
  prevActiveIndex,
  resolveGuessValue,
  suggestGames,
} from "../lib/daily/autocomplete";
import { guessMatchesAnswer } from "../lib/daily/guess";
import { applyGuess, createPlayState } from "../lib/daily/play";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expect(condition: unknown, message: string): void {
  if (!condition) fail(message);
}

const catalog = loadBundledCatalog();
const games = guessCatalogFromGames(catalog.games);
const hades = catalog.games.find((game) => game.id === "g-hades");
const celeste = catalog.games.find((game) => game.id === "g-celeste");
if (!hades || !celeste) fail("seed must include Hades and Celeste");

const hadesAccepted = [hades.title, ...hades.aliases.en, ...hades.aliases.zh, ...hades.aliases.ja];

expect(games.length === catalog.games.filter((game) => game.status === "active").length, "index is active games");
expect(
  games.every((game) => game.title.length > 0 && Array.isArray(game.aliases.en)),
  "slim index keeps title + aliases",
);
expect(
  JSON.stringify(games[0]).includes("steam_app_id") === false,
  "slim index omits extra catalog fields",
);

const hidden = {
  ...hades,
  id: "g-hidden-test",
  slug: "hidden-test",
  status: "hidden" as const,
  title: "Hidden Test Game",
};
expect(
  !guessCatalogFromGames([...catalog.games, hidden]).some((game) => game.id === "g-hidden-test"),
  "hidden games are omitted from autocomplete",
);
console.log("ok — slim catalog index");

expect(suggestGames("", games).length === 0, "empty input yields no suggestions");
expect(suggestGames("   ", games).length === 0, "whitespace input yields no suggestions");
expect(suggestGames("!!!", games).length === 0, "punctuation-only input yields no suggestions");
expect(
  suggestGames("x".repeat(MAX_GUESS_INPUT_LENGTH), games).length === 0,
  "overlong unmatched input yields no suggestions",
);
expect(
  suggestGames(`${"x".repeat(500)}`, games).length === 0,
  "input longer than the field cap still does not throw",
);
console.log("ok — empty / special / long input");

const hadesFromZh = suggestGames("哈迪斯", games);
expect(hadesFromZh[0]?.id === "g-hades", "Chinese alias suggests the English canonical title");
expect(hadesFromZh[0]?.title === "Hades", "Chinese hit fills canonical title");
expect(hadesFromZh[0]?.matchedAlias === "哈迪斯", "Chinese hit surfaces the matching alias");

const hadesFromJa = suggestGames("ハデス", games);
expect(hadesFromJa[0]?.id === "g-hades", "Japanese alias suggests Hades");
expect(hadesFromJa[0]?.title === "Hades", "Japanese hit fills canonical title");
expect(
  catalog.games.some((game) => game.aliases.ja.length > 0),
  "seed includes at least one Japanese alias",
);

const celesteFromZh = suggestGames("蔚蓝", games);
expect(celesteFromZh[0]?.title === "Celeste", "Chinese alias can hit Celeste");

const prefix = suggestGames("ha", games);
expect(prefix[0]?.title === "Hades", "prefix match is case-insensitive");

const punct = suggestGames("Hades!", games);
expect(punct[0]?.title === "Hades", "punctuation is ignored via normalizeGuess");

const token = suggestGames("valley", games);
expect(
  token.some((item) => item.title === "Stardew Valley"),
  "token / substring match hits Stardew Valley",
);
expect(
  token.some((item) => item.title === "Monument Valley"),
  "shared token can hit more than one catalog title",
);

expect(
  !suggestGames("not-a-real-game-title", games).some((item) => item.title === "Hades"),
  "unrelated query does not suggest catalog titles",
);
console.log("ok — alias / prefix / fuzzy matching");

const suggestions = suggestGames("e", games);
expect(suggestions.length > 1, "shared letter yields multiple suggestions");
expect(nextActiveIndex(-1, suggestions.length) === 0, "ArrowDown from none highlights first");
expect(nextActiveIndex(0, suggestions.length) === 1, "ArrowDown moves down");
expect(
  nextActiveIndex(suggestions.length - 1, suggestions.length) === 0,
  "ArrowDown wraps to first",
);
expect(prevActiveIndex(0, suggestions.length) === suggestions.length - 1, "ArrowUp wraps to last");
expect(prevActiveIndex(-1, 0) === -1, "no suggestions keeps index at -1");

expect(
  resolveGuessValue("ha", prefix, 0, true) === "Hades",
  "Enter / Guess with a highlight submits the canonical title",
);
expect(
  resolveGuessValue("ha", prefix, -1, false) === "ha",
  "Escape then submit keeps free text",
);
expect(
  resolveGuessValue("nope", [], -1, false) === "nope",
  "unmatched free text is still submittable",
);
console.log("ok — keyboard navigation helpers");

const picked = suggestGames("哈迪斯", games)[0];
if (!picked) fail("expected a Hades suggestion from 哈迪斯");
expect(picked.title === "Hades", "mobile tap target is the canonical title");
let play = createPlayState("2026-09-19");
play = applyGuess(play, picked.title, hadesAccepted);
expect(play.status === "won", "selecting a Chinese alias suggestion wins with the English title");

play = createPlayState("2026-09-19");
play = applyGuess(play, "ハデス", hadesAccepted);
expect(play.status === "won", "free-text Japanese alias still matches via normalizeGuess");

play = createPlayState("2026-09-19");
play = applyGuess(play, "totally-wrong", hadesAccepted);
expect(play.status === "playing", "free-text miss is allowed and counts as a wrong guess");
expect(play.guesses[0]?.text === "totally-wrong", "wrong free text is recorded as typed");

expect(guessMatchesAnswer("  哈迪斯  ", hadesAccepted), "alias compare stays case/space insensitive");
console.log("ok — select vs free-text submit");

console.log("All autocomplete tests passed.");
