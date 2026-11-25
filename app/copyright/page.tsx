import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/legal/metadata";
import { contactMailto, site } from "@/lib/site";

export const metadata = pageMetadata(
  "/copyright",
  "Copyright",
  `Copyright and rights information for ${site.name}. Report concerns at ${site.contactEmail}.`,
);

export default function CopyrightPage() {
  return (
    <StaticPage
      path="/copyright"
      title="Copyright"
      lead="Information about site materials, works referenced in the games, and how to report a rights concern."
    >
      <h2>Site materials</h2>
      <p>
        The original clue text, explanations, layout, and code are site
        materials. You may quote short excerpts with a link back to {site.url}.
        See the <Link href="/terms">terms of use</Link> for other limits.
      </p>

      <h2>Referenced works</h2>
      <p>
        Movie and book titles identify the works referenced in the puzzles.
        The works, artwork, and trademarks belong to their respective rights
        holders. References to a work are editorial.
      </p>

      <h2>Report infringement</h2>
      <p>
        To request removal of material, follow the{" "}
        <Link href="/dmca">DMCA notice instructions</Link> and email{" "}
        <a href={contactMailto("Copyright notice")}>{site.contactEmail}</a>.
      </p>
    </StaticPage>
  );
}
