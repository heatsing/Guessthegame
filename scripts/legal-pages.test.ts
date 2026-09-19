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
  footerNav.some((item) => item.href === "/" && item.label === "Today"),
  "footer still links Today",
);
expect(
  footerNav.some((item) => item.href === "/archive"),
  "footer still links Archive",
);
expect(
  footerNav.some((item) => item.href === "/themes" && item.label === "Themes"),
  "footer still links Themes",
);
console.log("ok — routes and footer nav");

expect(site.contactEmail.includes("@"), "contact email is a mailbox");
expect(
  site.contactEmail === "legal@guessthegame.net" ||
    Boolean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  "default placeholder email unless NEXT_PUBLIC_CONTACT_EMAIL is set",
);
expect(site.rawg.url === "https://rawg.io", "RAWG backlink target");
expect(
  site.attributionPlaceholder.toLowerCase().includes("rawg"),
  "RAWG attribution placeholder names RAWG",
);
expect(
  formatLegalUpdated("2026-09-19") === "September 19, 2026",
  "legal updated date formats in English",
);
console.log("ok — site contact and RAWG attribution");

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
    faq.answer.toLowerCase().includes("not affiliated"),
  ),
  "FAQ distinguishes guessthe.game",
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
  aboutSource.includes("Not affiliated with guessthe.game"),
  "About page states the brand split",
);
expect(aboutSource.includes("ThemeShot"), "About page names ThemeShot Daily");

const footerSource = readFileSync(join("components", "Footer.tsx"), "utf8");
expect(footerSource.includes("footerNav"), "Footer renders the shared nav");
expect(footerSource.includes("site.rawg.url"), "Footer links RAWG");

const headerSource = readFileSync(join("components", "Header.tsx"), "utf8");
expect(
  headerSource.includes('href="/how-to-play"'),
  "Header How to play points at the SSR page",
);
expect(headerSource.includes('href="/archive"'), "Header still links Archive");
expect(headerSource.includes('href="/themes"'), "Header still links Themes");
console.log("ok — DMCA notice copy and brand pages");

console.log("legal-pages tests passed");
