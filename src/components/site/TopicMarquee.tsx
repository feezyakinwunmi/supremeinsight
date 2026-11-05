import Link from "next/link";
import type { Department } from "@/lib/types";
import { DeptIcon } from "@/lib/departmentIcons";

// Endless scrolling strip of topics under the hero. Pauses on hover.
export function TopicMarquee({ departments }: { departments: Department[] }) {
  if (!departments.length) return null;
  const loop = [...departments, ...departments];
  return (
    <div className="pause-on-hover relative overflow-hidden border-b border-ink/[0.06] bg-white py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
      <div className="animate-marquee flex w-max gap-3">
        {loop.map((d, i) => (
          <Link
            key={`${d.id}-${i}`}
            href={`/?topic=${d.slug}#stories`}
            aria-hidden={i >= departments.length}
            tabIndex={i >= departments.length ? -1 : undefined}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-ink/[0.08] bg-paper py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink/75 transition hover:border-ink hover:bg-ink hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: d.color }}>
              <DeptIcon slug={d.slug} size={15} />
            </span>
            {d.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
