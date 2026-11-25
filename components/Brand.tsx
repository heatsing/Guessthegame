import Image from "next/image";
import Link from "next/link";

import mark from "@/app/icon.png";
import { site } from "@/lib/site";

export function Brand({ className }: { className: string }) {
  return (
    <Link className={className} href="/" prefetch={false}>
      <Image className="shrink-0" src={mark} alt="" width={24} height={24} unoptimized />
      {site.name}
    </Link>
  );
}
