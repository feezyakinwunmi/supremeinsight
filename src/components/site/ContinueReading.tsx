"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearSpot, inProgress, type SavedSpot } from "@/lib/readingProgress";
import { BookOpen, X } from "lucide-react";

/** Homepage row of articles this reader started but didn't finish (saved in their browser). */
export function ContinueReading() {
  const [items, setItems] = useState<SavedSpot[]>([]);
  useEffect(() => setItems(inProgress(3)), []);

  if (!items.length) return null;

  return (
    <section className="container-x pt-12">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
          <BookOpen size={17} />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Continue reading</h2>
          <p className="text-sm text-ink/50">Pick up where you left off.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((s) => (
          <div key={s.slug} className="group relative">
            <Link
              href={`/post/${s.slug}`}
              className="flex items-center gap-4 rounded-2xl bg-white p-3 pr-10 shadow-card ring-1 ring-ink/[0.04] transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink/5">
                {s.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: s.color ?? "#8a1c2c" }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {s.department && (
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: s.color ?? undefined }}>
                    {s.department}
                  </span>
                )}
                <p className="line-clamp-1 font-display text-sm font-semibold">{s.title}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
                    <span className="block h-full rounded-full" style={{ width: `${s.percent}%`, background: s.color ?? "#8a1c2c" }} />
                  </span>
                  <span className="text-[0.7rem] font-semibold text-ink/50">{s.percent}%</span>
                </div>
              </div>
            </Link>
            <button
              onClick={() => {
                clearSpot(s.slug);
                setItems((list) => list.filter((x) => x.slug !== s.slug));
              }}
              aria-label={`Remove ${s.title} from continue reading`}
              className="absolute right-2 top-2 rounded-full p-1.5 text-ink/30 transition hover:bg-ink/5 hover:text-ink sm:opacity-0 sm:group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
