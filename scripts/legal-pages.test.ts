/**
 * SSR legal/info pages: nav completeness, FAQ JSON-LD, DMCA notice copy.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { formatLegalUpdated } from "../lib/legal/dates";
import {
  DMCA_COUNTER_NOTICE_REQUIREMENTS,
  DMCA_NOTICE_REQUIREMENTS,
} from "../lib/legal/dmca";
import { HOW_TO_PLAY_FAQS, howToPlayFaqJsonLd } from "../lib/legal/faq";
import { footerNav, legalNav } from "../lib/legal/nav";
import { site } from "../lib/site";

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function expect(condition: unknown, message: string): void {
  if (!condition) fail(message);
}

const requiredHrefs = [
  "/how-to-play",
  "/about",
  "/privacy",
  "/terms",
  "/dmca",
  "/copyright",
] as const;

for (const href of requiredHrefs) {
  expect(
    legalNav.some((item) => item.href === href),
    `legalNav includes ${href}`,
  );
  expect(
    footerNav.some((item) => item.href === href),
    `footerNav includes ${href}`,
  );
  const file = join("app", href.slice(1), "page.tsx");
  expect(existsSync(file), `${file} exists`);
}
expect(
  footerNav.some((item) => item.href === "/" && item.label === "Home"),
  "footer links to the home page",
);
expect(footerNav.length === legalNav.length + 1, "footer links home and the public information pages");
console.log("ok — routes and footer nav");

expect(site.contactEmail.includes("@"), "contact email is a mailbox");
expect(
  site.contactEmail === "legal@guessthegame.net" ||
    Boolean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  "default placeholder email unless NEXT_PUBLIC_CONTACT_EMAIL is set",
);
expect(
  formatLegalUpdated("2026-09-19") === "September 19, 2026",
  "legal updated date formats in English",
);
console.log("ok — site contact and revision date");

const jsonLd = howToPlayFaqJsonLd();
expect(jsonLd["@context"] === "https://schema.org", "FAQ JSON-LD context");
expect(jsonLd["@type"] === "FAQPage", "FAQ JSON-LD type");
expect(
  jsonLd.mainEntity.length === HOW_TO_PLAY_FAQS.length,
  "JSON-LD questions match visible FAQ count",
);
for (const faq of HOW_TO_PLAY_FAQS) {
  const entity = jsonLd.mainEntity.find((item) => item.name === faq.question);
  expect(Boolean(entity), `JSON-LD includes ${faq.question}`);
  expect(
    entity?.acceptedAnswer.text === faq.answer,
    `JSON-LD answer matches visible text for ${faq.question}`,
  );
}
expect(
  HOW_TO_PLAY_FAQS.some((faq) =>
    faq.answer.includes("same tab") && faq.answer.includes("browser storage"),
  ),
  "FAQ explains same-tab restore",
);
console.log("ok — FAQ JSON-LD");

const notice = DMCA_NOTICE_REQUIREMENTS.join(" ").toLowerCase();
expect(notice.includes("signature"), "DMCA notice requires a signature");
expect(
  notice.includes("copyrighted work"),
  "DMCA notice identifies the work",
);
expect(notice.includes("url"), "DMCA notice asks for a URL locator");
expect(notice.includes("good-faith") || notice.includes("good faith"), "good faith");
expect(notice.includes("perjury"), "DMCA notice includes perjury statement");
expect(
  DMCA_COUNTER_NOTICE_REQUIREMENTS.length >= 4,
  "counter-notice instructions are present",
);

const dmcaSource = readFileSync(join("app", "dmca", "page.tsx"), "utf8");
expect(
  dmcaSource.includes("How to submit a takedown notice"),
  "DMCA page explains how to submit a notice",
);
expect(dmcaSource.includes("site.contactEmail"), "DMCA page shows contact email");

const aboutSource = readFileSync(join("app", "about", "page.tsx"), "utf8");
expect(
  aboutSource.includes("playGames.map"),
  "About page lists the playable games",
);

const howToPlaySource = readFileSync(join("app", "how-to-play", "page.tsx"), "utf8");
expect(howToPlaySource.includes("game.rule"), "How to play uses the actual game rules");

const privacySource = readFileSync(join("app", "privacy", "page.tsx"), "utf8");
expect(
  privacySource.includes("Cloudflare D1") && privacySource.includes("session storage"),
  "Privacy policy explains server and browser round storage",
);

const staticPageSource = readFileSync(join("components", "StaticPage.tsx"), "utf8");
expect(staticPageSource.includes("footerNav"), "Information pages render the shared footer navigation");
expect(staticPageSource.includes('href="/#games"'), "Information page header links to the games directory");

for (const href of requiredHrefs) {
  const source = readFileSync(join("app", href.slice(1), "page.tsx"), "utf8");
  expect(!/ThemeShot|RAWG|screenshot|\/archive\b|\/themes\b/i.test(source), `${href} describes the current site`);
}
console.log("ok — DMCA notice and current game information");

console.log("legal-pages tests passed");
