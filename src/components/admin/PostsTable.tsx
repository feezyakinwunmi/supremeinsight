"use client";
import { adminHref } from "@/lib/adminPath";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PostStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  updated_at: string;
  author_id: string | null;
  department: string | null;
  author: string | null;
};

const STATUS_STYLE: Record<PostStatus, string> = {
  draft: "bg-ink/10 text-ink/70",
  review: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-ink/10 text-ink/50",
};

const FILTERS: { key: PostStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "review", label: "In review" },
  { key: "draft", label: "Drafts" },
];

export function PostsTable({ rows, userId, isEditor }: { rows: PostRow[]; userId: string; isEditor: boolean }) {
  const router = useRouter();
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const shown = rows.filter(
    (r) => (filter === "all" || r.status === filter) && r.title.toLowerCase().includes(q.trim().toLowerCase())
  );

  async function setStatus(id: string, status: PostStatus) {
    setBusy(id);
    setError("");
    const { error: err } = await createClient().from("posts").update({ status }).eq("id", id);
    setBusy(null);
    if (err) return setError(err.message);
    router.refresh();
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
    setBusy(id);
    setError("");
    const { error: err } = await createClient().from("posts").delete().eq("id", id);
    setBusy(null);
    if (err) return setError(err.message);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${filter === f.key ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-ink/5"} border border-ink/10`}
          >
            {f.label} ({f.key === "all" ? rows.length : rows.filter((r) => r.status === f.key).length})
          </button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" className="field ml-auto !w-56" />
      </div>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
        {shown.length === 0 ? (
          <p className="p-10 text-center text-sm text-ink/50">No posts here yet.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {shown.map((r) => {
              const mine = r.author_id === userId;
              const canEdit = isEditor || (mine && (r.status === "draft" || r.status === "review"));
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={adminHref(`/posts/${r.id}`)} className="block truncate font-semibold hover:text-brand hover:underline">
                      {r.title || "Untitled"}
                    </Link>
                    <p className="text-xs text-ink/50">
                      {r.department ?? "No department"} · {r.author ?? "Unknown"} · updated {formatDate(r.updated_at)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                  <div className="flex items-center gap-1.5">
                    {r.status === "published" && (
                      <Link href={`/post/${r.slug}`} target="_blank" className="btn btn-ghost !px-3 !py-1.5 !text-xs">
                        View
                      </Link>
                    )}
                    {canEdit && (
                      <Link href={adminHref(`/posts/${r.id}`)} className="btn btn-ghost !px-3 !py-1.5 !text-xs">
                        <Pencil size={13} /> Edit
                      </Link>
                    )}
                    {isEditor && r.status === "review" && (
                      <button type="button" disabled={busy === r.id} onClick={() => setStatus(r.id, "published")} className="btn btn-primary !px-3 !py-1.5 !text-xs">
                        Publish
                      </button>
                    )}
                    {isEditor && r.status === "published" && (
                      <button type="button" disabled={busy === r.id} onClick={() => setStatus(r.id, "draft")} className="btn btn-ghost !px-3 !py-1.5 !text-xs">
                        Unpublish
                      </button>
                    )}
                    {isEditor && (
                      <button type="button" disabled={busy === r.id} onClick={() => remove(r.id, r.title)} className="btn btn-danger !px-2.5 !py-1.5" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
