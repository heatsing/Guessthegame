import Link from "next/link";

import { legalNav } from "@/lib/legal/nav";

import { Brand } from "./Brand";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Brand className={styles.brand} />
      <nav aria-label="Footer">
        {legalNav.map(({ href, label }) => (
          <Link href={href} key={href}>{label}</Link>
        ))}
      </nav>
    </footer>
  );
}
