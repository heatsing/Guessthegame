import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/legal/metadata";
import { contactMailto, site } from "@/lib/site";

export const metadata = pageMetadata(
  "/copyright",
  "Copyright",
  `Copyright and media rights on ${site.name}. Game screenshots belong to their owners. Report infringement at ${site.contactEmail}.`,
);

export default function CopyrightPage() {
  return (
    <StaticPage
      path="/copyright"
      title="Copyright"
      lead="Game screenshots and trademarks belong to their respective owners. This page explains what GuessTheGame.net claims — and what it does not."
    >
      <h2>Site materials</h2>
      <p>
        Original writing, layout, and code on {site.name} are provided for the
        ThemeShot Daily puzzle. You may not copy the site wholesale. Short
        quotations with a link back to {site.url} are fine.
      </p>

      <h2>Games, trademarks, and screenshots</h2>
      <p>
        Video-game titles, logos, characters, and screenshots are the property
        of their developers, publishers, and other rights holders. {site.name}{" "}
        does not claim ownership of those works. Appearance of a title in the
        catalog is not affiliation, sponsorship, or endorsement.
      </p>
      <p>
        ThemeShot stills are self-hosted. We prefer official press kits with
        written permission to use the stills on a daily puzzle site that may
        later show ads. Steam CDN artwork is not treated as a license.
      </p>

      <h2>Metadata attribution</h2>
      <p>
        Game metadata may include data from{" "}
        <a href={site.rawg.url} rel="noopener noreferrer">
          {site.rawg.name}
        </a>
        . {site.attributionPlaceholder}
      </p>

      <h2>Not affiliated with guessthe.game</h2>
      <p>
        {site.disclaimer} The {site.product} name and this domain are used to
        describe this independent puzzle, not any other guessing site. See{" "}
        <Link href="/about">About</Link>.
      </p>

      <h2>Report infringement</h2>
      <p>
        If you are a rights holder and you want an image or page taken down,
        follow the notice instructions on <Link href="/dmca">DMCA</Link> and
        email <a href={contactMailto("Copyright notice")}>{site.contactEmail}</a>
        .
      </p>
    </StaticPage>
  );
}
