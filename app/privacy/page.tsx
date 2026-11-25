import Link from "next/link";

import { StaticPage } from "@/components/StaticPage";
import { DAILY_STORAGE_KEY } from "@/lib/daily/constants";
import { pageMetadata } from "@/lib/legal/metadata";
import { contactMailto, site } from "@/lib/site";

export const metadata = pageMetadata(
  "/privacy",
  "Privacy",
  `Privacy policy for ${site.name}. Read how we store local play state and anonymous game statistics. Contact ${site.contactEmail}.`,
);

export default function PrivacyPage() {
  return (
    <StaticPage
      path="/privacy"
      title="Privacy policy"
      lead={`${site.name} does not run user accounts. We use browser storage to resume play and store anonymous round statistics for the clue games.`}
    >
      <h2>Who we are</h2>
      <p>
        This policy covers {site.name} ({site.product}) at {site.url}. For
        brand questions see <Link href="/about">About</Link>. Contact:{" "}
        <a href={contactMailto()}>{site.contactEmail}</a>.
      </p>

      <h2>What we collect</h2>
      <p>
        We do not ask you to create an account, and we do not run a cloud
        leaderboard. ThemeShot play, win/loss counts, guess distribution, and
        win streak are stored locally in this browser under the{" "}
        <code>{DAILY_STORAGE_KEY}</code> key.
      </p>
      <p>
        The clue games use a randomly generated session identifier. We store
        the question version, hint progress and any completed result so repeat
        submissions return the same outcome. We count starts, completed rounds
        and second-round starts without requiring a name or email address.
      </p>
      <p>
        If you email us (for example a DMCA notice), we receive whatever you
        include in that message — typically your name, address, and the URLs
        you cite — so we can respond.
      </p>

      <h2>Cookies and similar storage</h2>
      <p>
        This MVP does not use advertising cookies or a marketing pixel. The
        host (for example Cloudflare) may set strictly necessary cookies to operate
        the site. ThemeShot uses localStorage for play state and stats. The
        clue games use sessionStorage to restore your current round in the
        same tab.
      </p>
      <p>
        Clearing site data, using a private window, or switching browsers
        resets local stats. That data is not synced.
      </p>

      <h2>Analytics and ads</h2>
      <p>
        Ads are out of scope until screenshot rights coverage is high enough.
        We do not currently attach a third-party analytics or ads SDK. If that
        changes, this policy will be updated before any such script ships.
      </p>

      <h2>Children</h2>
      <p>
        The site is a general-audience puzzle. We do not knowingly collect
        personal information from children. Do not send us information about a
        child in an email unless you are the parent or guardian and it is
        needed for a rights request.
      </p>

      <h2>Third parties</h2>
      <p>
        Game metadata may include data from{" "}
        <a href={site.rawg.url} rel="noopener noreferrer">
          {site.rawg.name}
        </a>
        . Screenshots are self-hosted. Visiting those third-party sites is
        governed by their own policies.
      </p>

      <h2>How long we keep information</h2>
      <p>
        ThemeShot browser storage lasts until you clear it. Clue game tab
        storage normally ends when you close the tab. Email we receive is kept only
        as long as needed to handle the request and any legal obligation that
        follows (for example a DMCA record).
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Clear this site&apos;s data in your browser to delete local stats.</li>
        <li>
          Email <a href={contactMailto()}>{site.contactEmail}</a> to ask us to
          delete correspondence we hold, subject to law.
        </li>
      </ul>

      <h2>Changes</h2>
      <p>
        We may update this policy. The date at the bottom of the page is the
        latest revision. Continued use after a change means you accept the
        updated policy.
      </p>

      <p>
        Also see <Link href="/terms">Terms of use</Link>.
      </p>
    </StaticPage>
  );
}
