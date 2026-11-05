import Link from "next/link";
import type { Department } from "@/lib/types";
import { Logo } from "./Header";

export function Footer({ departments }: { departments: Department[] }) {
  return (
    <footer className="mt-24 bg-ink text-white/70">
      <div className="container-x">
        <div className="grid gap-12 py-16 md:grid-cols-[1.3fr_2fr_1fr]">
          <div className="space-y-4">
            <Logo light />
            <p className="max-w-xs text-sm leading-relaxed text-white/55">
              An independent publication exploring the issues, developments and opportunities shaping the Christian marketplace.
            </p>
            <Link href="/newsletter" className="btn !mt-6 bg-white text-ink hover:bg-white/90">
              Get the newsletter
            </Link>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">Topics</h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {departments.map((d) => (
                <li key={d.id}>
                  <Link href={`/section/${d.slug}`} className="transition hover:text-white">
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="transition hover:text-white">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/newsletter" className="transition hover:text-white">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/search" className="transition hover:text-white">
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-xs text-white/40">
          &copy; {new Date().getFullYear()} SupremeInsight. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
