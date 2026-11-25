import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import {
  DMCA_COUNTER_NOTICE_REQUIREMENTS,
  DMCA_NOTICE_REQUIREMENTS,
} from "@/lib/legal/dmca";
import { pageMetadata } from "@/lib/legal/metadata";
import { contactMailto, site } from "@/lib/site";

export const metadata = pageMetadata(
  "/dmca",
  "DMCA",
  `How to submit a copyright notice or counter-notice to ${site.name}. Contact ${site.contactEmail}.`,
);

export default function DmcaPage() {
  return (
    <StaticPage
      path="/dmca"
      title="DMCA"
      lead={`If you believe material on ${site.name} infringes your copyright, you can send a notice to our public contact.`}
    >
      <h2>Copyright contact</h2>
      <p>
        Send DMCA notices and counter-notices by email to{" "}
        <a href={contactMailto("DMCA takedown notice")}>{site.contactEmail}</a>.
      </p>
      <p>
        Put <strong>DMCA takedown notice</strong> or{" "}
        <strong>DMCA counter-notice</strong> in the subject line so we can
        route it.
      </p>

      <h2>How to submit a takedown notice</h2>
      <p>
        Under 17 U.S.C. § 512(c)(3), a notice of claimed infringement must
        include substantially the following. Incomplete notices may be ignored.
      </p>
      <ol>
        {DMCA_NOTICE_REQUIREMENTS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <p>
        Include the exact page URL and describe the material so we can locate
        it. For a puzzle, include the text of the clue you are reporting.
      </p>
      <p>
        Knowingly misrepresenting that material is infringing may expose you to
        liability under 17 U.S.C. § 512(f).
      </p>

      <h2>What we do after a valid notice</h2>
      <p>
        If the notice is complete, we will promptly remove or disable access to
        the specified material when we can identify it, and we may record the
        request.
      </p>

      <h2>Counter-notice</h2>
      <p>
        If your material was removed and you believe that was a mistake or
        misidentification, you may send a counter-notification to{" "}
        <a href={contactMailto("DMCA counter-notice")}>{site.contactEmail}</a>.
        Include the following information.
      </p>
      <ol>
        {DMCA_COUNTER_NOTICE_REQUIREMENTS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <p>
        If we receive a valid counter-notice, we may restore the material
        unless the original complainant files a court action as provided in
        § 512(g).
      </p>

      <h2>Trademarks and other complaints</h2>
      <p>
        For trademark or other rights issues, email the same address and
        include the page URL. See <Link href="/copyright">Copyright</Link> for
        information about the site&apos;s materials and referenced works.
      </p>
    </StaticPage>
  );
}
