import Link from "next/link";
import type { Department } from "@/lib/types";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-display text-base font-bold text-white">
        SI
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}>
        Supreme<span className={light ? "text-white/60" : "text-brand"}>Insight</span>
      </span>
    </span>
  );
}

// departments kept in the signature so the layout doesn't need to change
export function Header(_props: { departments?: Department[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/[0.06] bg-white/85 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="SupremeInsight home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link href="/about" className="rounded-full px-4 py-2 text-ink/70 transition hover:bg-ink/5 hover:text-ink">
            About
          </Link>
          <Link href="/contact" className="rounded-full bg-ink px-4 py-2 text-white transition hover:bg-ink/85">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
