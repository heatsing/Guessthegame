import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/legal/metadata";
import { contactMailto, site } from "@/lib/site";

export const metadata = pageMetadata(
  "/terms",
  "Terms of use",
  `Terms for playing and using ${site.name}, including acceptable use and intellectual property.`,
);

export default function TermsPage() {
  return (
    <StaticPage
      path="/terms"
      title="Terms of use"
      lead={`These terms govern your use of ${site.name}.`}
    >
      <h2>Agreement</h2>
      <p>
        By using {site.name}, you agree to these terms and to
        the <Link href="/privacy">Privacy policy</Link>. If you do not agree,
        do not use the site.
      </p>

      <h2>The service</h2>
      <p>
        The site offers written guessing games and logic puzzles. We may
        change features, correct or withdraw questions, and remove material
        in response to a rights issue.
      </p>

      <h2>License to use the site</h2>
      <p>
        We grant you a limited, revocable, non-exclusive, non-transferable
        license to access the site for personal, non-commercial play. You may
        not scrape, bulk-download, or republish our pages or question bank
        except as allowed by law (for example a short quotation with
        attribution).
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not attack, overload, or probe the site.</li>
        <li>Do not attempt to extract unpublished answers from APIs or HTML.</li>
        <li>Use the answer fields for gameplay.</li>
        <li>
          Do not use the site to infringe copyright or to impersonate{" "}
          {site.name}.
        </li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        See <Link href="/copyright">Copyright</Link> for information about
        site materials and referenced works. To request removal, follow the{" "}
        <Link href="/dmca">DMCA notice instructions</Link>.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided &quot;as is&quot; and &quot;as available.&quot; We
        do not warrant that a particular puzzle will be available, that an
        answer is unambiguous, or that saved play will persist. To the fullest extent
        permitted by law, we disclaim implied warranties of merchantability,
        fitness for a particular purpose, and non-infringement.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {site.name} and its operators
        are not liable for indirect, incidental, special, consequential, or
        punitive damages, or for lost data (including saved play), arising
        from your use of the site. Our total liability for any claim relating
        to the site will not exceed zero US dollars because play is free.
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
        Email <a href={contactMailto()}>{site.contactEmail}</a> with questions.
      </p>
    </StaticPage>
  );
}
