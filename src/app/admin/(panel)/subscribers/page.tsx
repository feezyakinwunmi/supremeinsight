import { requireStaff } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import { newsletterConfigured } from "@/lib/newsletter";
import { AlertTriangle, Download, Mail, UserCheck, UserMinus } from "lucide-react";

type Sub = { id: string; email: string; department_ids: string[]; status: string; created_at: string };

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const { supabase } = await requireStaff();
  const [{ data: subs, error }, { data: depts }] = await Promise.all([
    supabase.from("newsletter_subscribers").select("id, email, department_ids, status, created_at").order("created_at", { ascending: false }),
    supabase.from("departments").select("id, name, color").order("sort_order"),
  ]);

  const rows = (subs ?? []) as Sub[];
  const deptMap = new Map((depts ?? []).map((d) => [d.id as string, d as { id: string; name: string; color: string }]));
  const active = rows.filter((r) => r.status === "active");
  const everything = active.filter((r) => r.department_ids.length === 0).length;
  const perDept = (depts ?? []).map((d) => ({
    ...d,
    count: active.filter((r) => r.department_ids.includes(d.id as string)).length,
  }));

  const csv =
    "email,status,topics,subscribed\n" +
    rows
      .map((r) =>
        [r.email, r.status, r.department_ids.length ? r.department_ids.map((id) => deptMap.get(id)?.name ?? "").join("; ") : "All topics", r.created_at]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Subscribers</h1>
          <p className="mt-1 text-sm text-ink/55">People who signed up for new-story emails, and the topics they chose.</p>
        </div>
        {rows.length > 0 && (
          <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`} download="subscribers.csv" className="btn btn-ghost">
            <Download size={16} /> Export CSV
          </a>
        )}
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          The newsletter tables aren&apos;t set up yet. Run <code>supabase/newsletter-and-contact.sql</code> in the Supabase SQL editor.
        </p>
      )}

      {!newsletterConfigured() && (
        <div className="mt-6 flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            Email sending is off. People can subscribe, but no emails go out until you add <code>RESEND_API_KEY</code> and{" "}
            <code>NEWSLETTER_FROM</code> to your environment settings (see README).
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: UserCheck, label: "Active subscribers", value: active.length },
          { icon: Mail, label: "Want every story", value: everything },
          { icon: UserMinus, label: "Unsubscribed", value: rows.length - active.length },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <s.icon size={20} />
            </span>
            <div>
              <p className="font-display text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-ink/55">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold">Subscribers per topic</h2>
        <div className="flex flex-wrap gap-2">
          {perDept.map((d) => (
            <span key={d.id as string} className="pill border border-ink/10">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color as string }} />
              {d.name as string} <span className="text-ink/45">{d.count}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Topics</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink/50">
                  No subscribers yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-medium">{r.email}</td>
                <td className="px-4 py-3">
                  {r.department_ids.length === 0 ? (
                    <span className="text-ink/50">All topics</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {r.department_ids.map((id) => {
                        const d = deptMap.get(id);
                        return d ? (
                          <span key={id} className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: d.color }}>
                            {d.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      r.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-ink/5 text-ink/50"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-ink/55">{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
