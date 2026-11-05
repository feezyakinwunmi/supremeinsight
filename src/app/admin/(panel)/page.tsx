import { adminHref } from "@/lib/adminPath";
import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { BarChart, StatCard } from "@/components/admin/Charts";
import { formatSeconds } from "@/lib/utils";
import { FilePlus2 } from "lucide-react";

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

export default async function DashboardPage() {
  const { supabase, profile } = await requireStaff();

  const [{ data: posts }, { data: daily }, { data: stats }] = await Promise.all([
    supabase.from("posts").select("id, status"),
    supabase.rpc("analytics_daily", { p_days: 30 }),
    supabase.rpc("analytics_posts", { p_days: 30 }),
  ]);

  const count = (s: string) => (posts ?? []).filter((p) => p.status === s).length;
  const dailyRows = (daily ?? []) as DailyRow[];
  const statRows = (stats ?? []) as PostStat[];
  const totalViews = dailyRows.reduce((n, d) => n + Number(d.views), 0);
  const withTime = statRows.filter((s) => Number(s.avg_seconds) > 0);
  const avgTime = withTime.length ? withTime.reduce((n, s) => n + Number(s.avg_seconds), 0) / withTime.length : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
          <p className="text-sm text-ink/55">Here&apos;s how SupremeInsight is doing.</p>
        </div>
        <Link href={adminHref("/posts/new")} className="btn btn-primary">
          <FilePlus2 size={16} /> New post
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Published" value={count("published")} />
        <StatCard label="In review" value={count("review")} hint={count("review") ? "Waiting for an editor" : undefined} />
        <StatCard label="Drafts" value={count("draft")} />
        <StatCard label="Views" value={totalViews} hint="last 30 days" />
        <StatCard label="Avg. time" value={formatSeconds(avgTime)} hint="on an article" />
      </div>

      <section className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-bold">Views — last 30 days</h2>
        <BarChart data={dailyRows.map((d) => ({ label: d.day.slice(5), value: Number(d.views) }))} />
      </section>

      <section className="rounded-xl border border-ink/10 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Top posts</h2>
          <Link href={adminHref("/analytics")} className="text-sm font-semibold text-brand hover:underline">
            Full analytics →
          </Link>
        </div>
        {statRows.length === 0 ? (
          <p className="text-sm text-ink/50">Publish your first post to start seeing numbers.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {statRows.slice(0, 5).map((s) => (
              <li key={s.post_id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{s.title}</p>
                  <p className="text-xs text-ink/50">{s.department ?? "No department"}</p>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="font-bold">{s.views} views</p>
                  <p className="text-xs text-ink/50">{formatSeconds(Number(s.avg_seconds))} avg</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
