"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { Check, Inbox, Mail, RotateCcw } from "lucide-react";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  handled: boolean;
  created_at: string;
};

export function MessagesList({ initial }: { initial: ContactMessage[] }) {
  const [items, setItems] = useState(initial);
  const [show, setShow] = useState<"open" | "all">("open");
  const [error, setError] = useState("");

  async function toggle(m: ContactMessage) {
    setError("");
    const { error: err } = await createClient().from("contact_messages").update({ handled: !m.handled }).eq("id", m.id);
    if (err) return setError(err.message);
    setItems((list) => list.map((x) => (x.id === m.id ? { ...x, handled: !m.handled } : x)));
  }

  const open = items.filter((m) => !m.handled).length;
  const visible = show === "open" ? items.filter((m) => !m.handled) : items;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["open", "all"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setShow(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${show === k ? "bg-ink text-white" : "bg-white text-ink/60 hover:text-ink"}`}
          >
            {k === "open" ? `To do (${open})` : `All (${items.length})`}
          </button>
        ))}
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white py-14 text-center text-ink/50">
          <Inbox className="mx-auto mb-2" />
          {show === "open" ? "All caught up." : "No messages yet."}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((m) => (
            <li key={m.id} className={`rounded-2xl border border-ink/10 bg-white p-5 ${m.handled ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {m.name} <span className="font-normal text-ink/50">&middot; {m.email}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink/50">
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 font-semibold text-brand">{m.topic}</span> &middot; {formatDate(m.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`}
                    className="btn btn-ghost !px-3 !py-1.5 !text-xs"
                  >
                    <Mail size={14} /> Reply
                  </a>
                  <button onClick={() => toggle(m)} className="btn btn-ghost !px-3 !py-1.5 !text-xs">
                    {m.handled ? <RotateCcw size={14} /> : <Check size={14} />}
                    {m.handled ? "Reopen" : "Mark handled"}
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
