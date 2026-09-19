import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[color:var(--surface)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 text-sm text-[color:var(--muted)] sm:px-6">
        <p>{site.disclaimer}</p>
        <p>
          <span className="font-medium text-[color:var(--foreground)]">
            Attribution
          </span>
          <span className="mt-1 block">{site.attributionPlaceholder}</span>
        </p>
        <p className="text-xs">Privacy · Terms · DMCA · About — coming soon</p>
      </div>
    </footer>
  );
}
