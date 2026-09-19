import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/legal/metadata";
import { contactMailto, site } from "@/lib/site";

export const metadata = pageMetadata(
  "/terms",
  "Terms of use",
  `Terms of use for ${site.name} (${site.product}). Independent daily screenshot puzzle. Not affiliated with guessthe.game.`,
);

export default function TermsPage() {
  return (
    <StaticPage
      path="/terms"
      title="Terms of use"
      lead={`These terms govern your use of ${site.name}. They are a standard template and are not a substitute for legal advice.`}
    >
      <h2>Agreement</h2>
      <p>
        By using {site.name} ({site.product}), you agree to these terms and to
        the <Link href="/privacy">Privacy policy</Link>. If you do not agree,
        do not use the site.
      </p>

      <h2>The service</h2>
      <p>
        We publish one daily screenshot puzzle (and a short archive of past
        days). Features may change. We may pause a day, correct a catalog
        error, or take down media when a rights issue appears.
      </p>
      <p>
        {site.disclaimer} See <Link href="/about">About</Link>.
      </p>

      <h2>License to use the site</h2>
      <p>
        We grant you a limited, revocable, non-exclusive, non-transferable
        license to access the site for personal, non-commercial play. You may
        not scrape, bulk-download, or republish our pages, catalog, or images
        except as allowed by law (for example a short quotation with
        attribution).
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not attack, overload, or probe the site.</li>
        <li>Do not attempt to extract unpublished answers from APIs or HTML.</li>
        <li>Do not upload or post content — this MVP has no user submissions.</li>
        <li>
          Do not use the site to infringe copyright or to impersonate{" "}
          {site.name}, {site.product}, or guessthe.game.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        Site chrome, copy, and original code are described on{" "}
        <Link href="/copyright">Copyright</Link>. Game titles, trademarks, and
        screenshots belong to their respective owners. We do not claim those
        rights. Takedown process: <Link href="/dmca">DMCA</Link>.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided &quot;as is&quot; and &quot;as available.&quot; We
        do not warrant that a given day will be available, that an answer is
        unambiguous, or that local stats will persist. To the fullest extent
        permitted by law, we disclaim implied warranties of merchantability,
        fitness for a particular purpose, and non-infringement.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {site.name} and its operators
        are not liable for indirect, incidental, special, consequential, or
        punitive damages, or for lost data (including local stats), arising
        from your use of the site. Our total liability for any claim relating
        to the site will not exceed zero US dollars, because the MVP is free
        and has no paid tier.
      </p>

      <h2>Indemnity</h2>
      <p>
        You will defend and indemnify {site.name} and its operators against
        claims arising from your misuse of the site or your violation of these
        terms.
      </p>

      <h2>Changes and termination</h2>
      <p>
        We may update these terms. The date at the bottom of the page is the
        latest revision. We may suspend or stop the service at any time.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a href={contactMailto()}>{site.contactEmail}</a>.
      </p>
    </StaticPage>
  );
}
