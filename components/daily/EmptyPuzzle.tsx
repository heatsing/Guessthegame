export function EmptyPuzzle({ date }: { date: string }) {
  return (
    <section
      className="rounded-xl border border-dashed border-white/15 bg-[color:var(--surface)] px-4 py-10 text-center"
      role="status"
    >
      <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
        Puzzle not ready
      </h2>
      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
        There is no ThemeShot scheduled for {date} (UTC). Check back after the
        next catalog update.
      </p>
    </section>
  );
}
