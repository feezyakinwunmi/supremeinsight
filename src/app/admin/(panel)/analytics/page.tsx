import { adminHref } from "@/lib/adminPath";
import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { BarChart, HBars, StatCard } from "@/components/admin/Charts";
import { formatSeconds } from "@/lib/utils";

type DailyRow = { day: string; views: number; visitors: number };
type PostStat = {
  post_id: string;
  title: string;
  slug: string;
  department: string | null;
  views: number;
  visitors: number;
  avg_seconds: number;
  avg_scroll: number;
  clicks: number;
};
type SourceRow = { kind: "referrer" | "device"; label: string; total: number };
type ClickRow = { href: string; clicks: number };

const RANGES = [7, 30, 90];

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: raw } = await searchParams;
  const days = RANGES.includes(Number(raw)) ? Number(raw) : 30;
  const { supabase } = await requireStaff();

  const [{ data: daily }, { data: stats }, { data: sources }, { data: clicks }] = await Promise.all([
    supabase.rpc("analytics_daily", { p_days: days }),
    supabase.rpc("analytics_posts", { p_days: days }),
    supabase.rpc("analytics_sources", { p_days: days }),
    supabase.rpc("analytics_clicks", { p_days: days }),
  ]);

  const dailyRows = (daily ?? []) as DailyRow[];
  const statRows = (stats ?? []) as PostStat[];
  const sourceRows = (sources ?? []) as SourceRow[];
  const clickRows = (clicks ?? []) as ClickRow[];

  const totalViews = dailyRows.reduce((n, d) => n + Number(d.views), 0);
  const totalClicks = statRows.reduce((n, s) => n + Number(s.clicks), 0);
  const withTime = statRows.filter((s) => Number(s.avg_seconds) > 0);
  const avgTime = withTime.length ? withTime.reduce((n, s) => n + Number(s.avg_seconds), 0) / withTime.length : 0;
  const withScroll = statRows.filter((s) => Number(s.avg_scroll) > 0);
  const avgScroll = withScroll.length ? withScroll.reduce((n, s) => n + Number(s.avg_scroll), 0) / withScroll.length : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={adminHref(`/analytics?days=${r}`)}
              className={`rounded-full border border-ink/10 px-3.5 py-1.5 text-xs font-bold ${days === r ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-ink/5"}`}
            >
              {r} days
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Views" value={totalViews} />
        <StatCard label="Avg. time on article" value={formatSeconds(avgTime)} hint="active reading time" />
        <StatCard label="Avg. scroll depth" value={`${Math.round(avgScroll)}%`} />
        <StatCard label="Link clicks" value={totalClicks} />
      </div>

      <section className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Views per day</h2>
        <BarChart data={dailyRows.map((d) => ({ label: d.day.slice(5), value: Number(d.views) }))} />
      </section>

      <section className="overflow-hidden rounded-xl border border-ink/10 bg-white">
        <h2 className="border-b border-ink/10 p-5 font-display text-lg font-bold">Posts</h2>
        {statRows.length === 0 ? (
          <p className="p-6 text-sm text-ink/50">No published posts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-ink/[0.03] text-xs uppercase tracking-wider text-ink/50">
                <tr>
                  <th className="px-5 py-3">Post</th>
                  <th className="px-3 py-3 text-right">Views</th>
                  <th className="px-3 py-3 text-right">Readers</th>
                  <th className="px-3 py-3 text-right">Avg. time</th>
                  <th className="px-3 py-3 text-right">Scroll</th>
                  <th className="px-5 py-3 text-right">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {statRows.map((s) => (
                  <tr key={s.post_id}>
                    <td className="max-w-xs px-5 py-3">
                      <Link href={`/post/${s.slug}`} target="_blank" className="block truncate font-semibold hover:text-brand hover:underline">
                        {s.title}
                      </Link>
                      <span className="text-xs text-ink/50">{s.department ?? "—"}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-bold">{s.views}</td>
                    <td className="px-3 py-3 text-right">{s.visitors}</td>
                    <td className="px-3 py-3 text-right">{formatSeconds(Number(s.avg_seconds))}</td>
                    <td className="px-3 py-3 text-right">{Math.round(Number(s.avg_scroll))}%</td>
                    <td className="px-5 py-3 text-right">{s.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Where readers come from</h2>
          <HBars rows={sourceRows.filter((s) => s.kind === "referrer").slice(0, 8).map((s) => ({ label: s.label, value: Number(s.total) }))} />
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Devices</h2>
          <HBars rows={sourceRows.filter((s) => s.kind === "device").map((s) => ({ label: s.label, value: Number(s.total) }))} />
        </section>
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Most clicked links</h2>
          <HBars rows={clickRows.slice(0, 8).map((c) => ({ label: c.href, value: Number(c.clicks) }))} />
        </section>
      </div>
    </div>
  );
}
