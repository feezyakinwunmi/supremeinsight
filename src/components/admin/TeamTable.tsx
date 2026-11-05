"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ROLES: { key: Role; label: string; hint: string }[] = [
  { key: "pending", label: "Pending (no access)", hint: "Signed up, not approved" },
  { key: "writer", label: "Writer", hint: "Writes drafts, submits for review" },
  { key: "editor", label: "Editor", hint: "Reviews, publishes, edits anyone's post" },
  { key: "admin", label: "Admin", hint: "Everything, including team roles" },
];

export function TeamTable({ people, meId }: { people: Profile[]; meId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function setRole(id: string, role: Role) {
    setBusy(id);
    setError("");
    const { error: err } = await createClient().from("profiles").update({ role }).eq("id", id);
    setBusy(null);
    if (err) return setError(err.message);
    router.refresh();
  }

  return (
    <div>
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
        <ul className="divide-y divide-ink/10">
          {people.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {p.full_name || "—"} {p.id === meId && <span className="text-xs font-normal text-ink/50">(you)</span>}
                </p>
                <p className="truncate text-xs text-ink/50">
                  {p.email} · joined {formatDate(p.created_at)}
                </p>
              </div>
              <select
                value={p.role}
                disabled={busy === p.id || p.id === meId}
                onChange={(e) => setRole(p.id, e.target.value as Role)}
                className="field !w-52"
                title={p.id === meId ? "You can't change your own role" : undefined}
              >
                {ROLES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>
      <ul className="mt-6 grid gap-2 text-sm text-ink/60 sm:grid-cols-2">
        {ROLES.map((r) => (
          <li key={r.key}>
            <strong className="text-ink">{r.label.replace(" (no access)", "")}</strong> — {r.hint}
          </li>
        ))}
      </ul>
    </div>
  );
}
