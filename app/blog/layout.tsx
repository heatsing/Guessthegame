import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SiteFooter } from "@/components/SiteFooter";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#dce1e8]">
        <nav aria-label="Site" className="mx-auto flex min-h-16 max-w-5xl items-center gap-5 px-5">
          <Brand className="mr-auto inline-flex items-center gap-2 text-lg font-bold" />
          <Link href="/#games">Games</Link><Link href="/blog">Blog</Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-14">{children}</main>
      <SiteFooter />
    </div>
  );
}
