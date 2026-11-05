"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const TOPICS = ["General", "Pitch a story", "Advertising & partnerships", "Press", "Feedback", "Corrections"];

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("busy");
    const { error: err } = await createClient().rpc("send_contact_message", {
      p_name: form.name,
      p_email: form.email,
      p_topic: form.topic,
      p_message: form.message,
    });
    if (err) {
      setState("idle");
      setError(err.message.startsWith("Please") ? err.message : "Something went wrong. Please try again.");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={32} />
        </span>
        <h2 className="mt-5 font-display text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 max-w-sm text-ink/60">Thanks, {form.name.split(" ")[0]}. Our team will reply to {form.email} as soon as possible.</p>
      </div>
    );
  }

  const input =
    "w-full rounded-xl border border-ink/10 bg-paper px-4 py-3 text-[0.95rem] outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Your name</span>
          <input required minLength={2} maxLength={120} value={form.name} onChange={set("name")} autoComplete="name" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Email address</span>
          <input required type="email" value={form.email} onChange={set("email")} autoComplete="email" className={input} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">What is it about?</span>
        <select value={form.topic} onChange={set("topic")} className={input}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Message</span>
        <textarea
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          value={form.message}
          onChange={set("message")}
          placeholder="Tell us how we can help…"
          className={`${input} resize-y`}
        />
      </label>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      <button type="submit" disabled={state === "busy"} className="btn btn-primary w-full rounded-xl py-3.5 sm:w-auto sm:px-8">
        {state === "busy" ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
        Send message
      </button>
    </form>
  );
}
