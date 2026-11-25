import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import { pageMetadata } from "@/lib/legal/metadata";
import { contactMailto, site } from "@/lib/site";

export const metadata = pageMetadata(
  "/privacy",
  "Privacy",
  `How ${site.name} saves play in your browser tab and uses pseudonymous round records.`,
);

export default function PrivacyPage() {
  return (
    <StaticPage
      path="/privacy"
      title="Privacy policy"
      lead={`This policy covers how ${site.name} saves your place in a game and uses pseudonymous round records.`}
    >
      <h2>Playing and restoring a round</h2>
      <p>
        You can play without an account. The game creates a random session ID
        and uses your browser’s session storage to save your current round,
        draft input, hints, and any result so you can continue in the same tab.
        If browser storage is unavailable, a reload may start a fresh round.
      </p>

      <h2>Server-side round data</h2>
      <p>
        Our Cloudflare D1 database stores round and question identifiers, the
        question version, timestamps, hint progress, and any completed result.
        A completed result can include the guess you submitted. A randomly
        generated session ID associates rounds with your game session without
        requiring your name or email address.
      </p>
      <p>
        We use these records to restore a round, return the same result for a
        repeat submission, and count activity such as round starts, completions,
        and second-round starts. Please enter game answers only.
      </p>

      <h2>Hosting and browser storage</h2>
      <p>
        Cloudflare hosts the site and processes incoming requests. It may use
        cookies or record request information for operation and security.
        The games use session storage for tab restore.
      </p>
      <p>
        Closing the tab normally ends its saved session. Clearing site data in
        your browser removes your local play state. The server stores its round
        records separately.
      </p>

      <h2>Email and rights requests</h2>
      <p>
        If you contact us, we receive the information you include in your
        message. A rights notice may contain contact details and URLs.
        We use the information to respond and handle the request.
      </p>
      <p>
        Email <a href={contactMailto()}>{site.contactEmail}</a> with privacy
        questions or to ask us to delete correspondence we hold, subject to law.
      </p>

      <h2>Children</h2>
      <p>
        The site is a general-audience puzzle site. We do not knowingly
        collect personal information from children.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. The date below identifies the latest
        revision. See also the <Link href="/terms">Terms of use</Link>.
      </p>
    </StaticPage>
  );
}
