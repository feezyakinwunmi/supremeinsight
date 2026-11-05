// Small, dependency-free charts used in the admin dashboards.

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink/50">{hint}</p>}
    </div>
  );
}

export function BarChart({ data, height = 140 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = Math.max(1, Math.ceil(data.length / 8));
  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-brand/80 transition group-hover:bg-brand"
              style={{ height: `${Math.max(d.value > 0 ? 3 : 0, (d.value / max) * 100)}%` }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] font-semibold text-white group-hover:block">
              {d.label}: {d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[3px] text-[10px] text-ink/45">
        {data.map((d, i) => (
          <span key={i} className="flex-1 overflow-visible whitespace-nowrap">
            {i % step === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="py-4 text-sm text-ink/50">No data yet.</p>;
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate font-semibold">{r.label}</span>
            <span className="shrink-0 text-ink/60">{r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/5">
            <div className="h-full rounded-full bg-brand/80" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
