import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { CheckCircle2, MailX } from "lucide-react";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function unsubscribe(formData: FormData) {
  "use server";
  const token = String(formData.get("token") ?? "");
  if (!UUID.test(token)) redirect("/newsletter/unsubscribe?status=invalid");
  const { data, error } = await createPublicClient().rpc("unsubscribe_newsletter", { p_token: token });
  redirect(`/newsletter/unsubscribe?status=${!error && data ? "done" : "invalid"}`);
}

// Uses a button (not an automatic action) so email link scanners can't unsubscribe people by accident.
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const { token, status } = await searchParams;

  let body: React.ReactNode;
  if (status === "done") {
    body = (
      <>
        <CheckCircle2 className="mx-auto text-emerald-600" size={40} />
        <h1 className="mt-4 font-display text-2xl font-semibold">You&apos;ve been unsubscribed</h1>
        <p className="mt-2 text-ink/60">You won&apos;t get any more emails from us. Changed your mind? You can subscribe again any time.</p>
        <Link href="/newsletter" className="btn btn-ghost mt-6">
          Subscribe again
        </Link>
      </>
    );
  } else if (status === "invalid" || !token || !UUID.test(token)) {
    body = (
      <>
        <MailX className="mx-auto text-ink/40" size={40} />
        <h1 className="mt-4 font-display text-2xl font-semibold">This link isn&apos;t valid</h1>
        <p className="mt-2 text-ink/60">Please use the unsubscribe link at the bottom of one of our emails.</p>
      </>
    );
  } else {
    body = (
      <form action={unsubscribe}>
        <MailX className="mx-auto text-brand" size={40} />
        <h1 className="mt-4 font-display text-2xl font-semibold">Unsubscribe from SupremeInsight?</h1>
        <p className="mt-2 text-ink/60">You&apos;ll stop receiving emails about new stories.</p>
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="btn btn-primary mt-6">
          Yes, unsubscribe me
        </button>
      </form>
    );
  }

  return (
    <div className="container-x py-20">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-ink/[0.04]">{body}</div>
    </div>
  );
}
