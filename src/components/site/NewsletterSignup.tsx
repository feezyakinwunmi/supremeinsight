"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, Loader2, Mail } from "lucide-react";

type Dept = { id: string; name: string; color: string };

// Email + optional topic picker. No topics picked = every new post.
export function NewsletterSignup({
  departments,
  tone = "dark",
  showTopics = true,
  defaultDepartmentId,
}: {
  departments: Dept[];
  tone?: "dark" | "light";
  showTopics?: boolean;
  defaultDepartmentId?: string;
}) {
  const [email, setEmail] = useState("");
  const [picked, setPicked] = useState<string[]>(defaultDepartmentId ? [defaultDepartmentId] : []);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const dark = tone === "dark";

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("busy");
    const { error: err } = await createClient().rpc("subscribe_newsletter", {
      p_email: email,
      p_department_ids: picked,
    });
    if (err) {
      setState("idle");
      setError(err.message.includes("valid email") ? "Please enter a valid email address." : "Something went wrong. Please try again.");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    const names = departments.filter((d) => picked.includes(d.id)).map((d) => d.name);
    return (
      <div className={`flex items-start gap-3 rounded-2xl p-5 ${dark ? "bg-white/10 text-white" : "bg-emerald-50 text-emerald-900"}`}>
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check size={16} />
        </span>
        <div>
          <p className="font-display font-semibold">You&apos;re subscribed!</p>
          <p className={`mt-1 text-sm ${dark ? "text-white/70" : "text-emerald-800/80"}`}>
            We&apos;ll email {email} when we publish new stories
            {names.length ? ` in ${names.join(", ")}` : ""}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {showTopics && departments.length > 0 && (
        <div>
          <p className={`mb-3 text-sm font-medium ${dark ? "text-white/70" : "text-ink/60"}`}>
            Pick the topics you care about <span className={dark ? "text-white/45" : "text-ink/40"}>(or leave empty for everything)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPicked([])}
              className={`pill border transition ${
                picked.length === 0
                  ? dark
                    ? "border-white bg-white text-ink"
                    : "border-ink bg-ink text-white"
                  : dark
                    ? "border-white/20 text-white/80 hover:border-white/50"
                    : "border-ink/15 bg-white text-ink/70 hover:border-ink/40"
              }`}
            >
              All topics
            </button>
            {departments.map((d) => {
              const on = picked.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(d.id)}
                  className={`pill border transition ${
                    on
                      ? "border-transparent text-white"
                      : dark
                        ? "border-white/20 text-white/80 hover:border-white/50"
                        : "border-ink/15 bg-white text-ink/70 hover:border-ink/40"
                  }`}
                  style={on ? { background: d.color } : undefined}
                >
                  {on && <Check size={12} />}
                  {d.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-2 rounded-2xl p-1.5 sm:flex-row ${dark ? "bg-white/10" : "border border-ink/10 bg-white shadow-card"}`}>
        <div className="relative flex-1">
          <Mail size={18} className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${dark ? "text-white/50" : "text-ink/35"}`} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            autoComplete="email"
            className={`w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-[0.95rem] outline-none ${
              dark ? "text-white placeholder:text-white/40" : "text-ink placeholder:text-ink/35"
            }`}
          />
        </div>
        <button type="submit" disabled={state === "busy"} className={`btn rounded-xl px-6 py-3 ${dark ? "bg-white text-ink hover:bg-white/90" : "btn-primary"}`}>
          {state === "busy" && <Loader2 size={16} className="animate-spin" />}
          Subscribe
        </button>
      </div>

      {error && <p className={`text-sm font-medium ${dark ? "text-red-300" : "text-red-700"}`}>{error}</p>}
      <p className={`text-xs ${dark ? "text-white/45" : "text-ink/45"}`}>Free. No spam. Unsubscribe with one click from any email.</p>
    </form>
  );
}
