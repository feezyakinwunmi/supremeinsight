"use client";
import { adminHref } from "@/lib/adminPath";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/site/Header";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const supabase = createClient();

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (err) return setError(err.message);
      router.replace(adminHref());
      router.refresh();
      return;
    }

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setBusy(false);
    if (err) return setError(err.message);
    if (data.session) {
      router.replace(adminHref());
      router.refresh();
    } else {
      setInfo("Account created. Check your email to confirm it, then sign in.");
      setMode("signin");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/">
            <Logo />
          </Link>
          <p className="mt-2 text-sm text-ink/55">Staff area</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <h1 className="font-display text-xl font-bold">{mode === "signin" ? "Sign in" : "Create your account"}</h1>

          {mode === "signup" && (
            <div>
              <label className="label">Full name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="field" autoComplete="name" />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" autoComplete="email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
          {info && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{info}</p>}

          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            className="w-full text-center text-xs font-semibold text-ink/50 hover:text-ink"
          >
            {mode === "signin" ? "First time setting up? Create the admin account" : "Back to sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
