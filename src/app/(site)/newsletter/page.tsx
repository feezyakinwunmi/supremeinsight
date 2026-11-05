import type { Metadata } from "next";
import { getDepartments } from "@/lib/queries";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { BellRing, Inbox, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Get an email when SupremeInsight publishes a new story in the topics you choose.",
};
export const revalidate = 3600;

const perks = [
  { icon: BellRing, title: "Only what you choose", text: "Pick your topics and hear only about new stories in them." },
  { icon: Inbox, title: "Straight to your inbox", text: "One short email each time a new story goes live." },
  { icon: ShieldCheck, title: "No spam, ever", text: "We never share your email. Unsubscribe with one click." },
];

export default async function NewsletterPage() {
  const departments = await getDepartments();
  return (
    <div className="container-x py-10 md:py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 md:px-14 md:py-16">
        <span className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/50 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <span className="pill bg-white/10 text-white/80">Newsletter</span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
            Never miss a story that matters to you
          </h1>
          <p className="mb-10 mt-4 max-w-xl text-lg text-white/60">
            Subscribe to SupremeInsight and choose your topics. We&apos;ll email you whenever a new story is published.
          </p>
          <NewsletterSignup departments={departments.map((d) => ({ id: d.id, name: d.name, color: d.color }))} tone="dark" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {perks.map((p) => (
          <div key={p.title} className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink/[0.04]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <p.icon size={19} />
            </span>
            <h2 className="mt-4 font-display font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm text-ink/60">{p.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
