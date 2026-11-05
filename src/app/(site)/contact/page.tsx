import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/site/ContactForm";
import { Clock, Handshake, Megaphone, MessagesSquare, Newspaper, PenLine } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with SupremeInsight: story pitches, partnerships, press and feedback.",
};

const reasons = [
  { icon: PenLine, title: "Pitch a story", text: "Have a story the Christian marketplace should hear? Tell us about it." },
  { icon: Handshake, title: "Partnerships", text: "Advertising, sponsorships and collaborations with our team." },
  { icon: Megaphone, title: "Press", text: "Media enquiries, interviews and requests for comment." },
  { icon: MessagesSquare, title: "Feedback", text: "Ideas, corrections or suggestions to make us better." },
];

export default function ContactPage() {
  return (
    <div className="space-y-16 pb-4">
      {/* Hero */}
      <section className="container-x pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/team.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
          <div className="relative max-w-2xl px-6 py-14 md:px-12 md:py-20">
            <span className="pill bg-white/10 text-white/85 backdrop-blur">Contact us</span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
              We&apos;d love to hear from you
            </h1>
            <p className="mt-4 text-lg text-white/70">Story ideas, partnerships, press or feedback: send us a message and our team will get back to you.</p>
          </div>
        </div>
      </section>

      {/* Form + info */}
      <section className="container-x grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-ink/[0.04] md:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Send us a message</h2>
          <p className="mb-8 mt-1 text-ink/55">All fields are required.</p>
          <ContactForm />
        </div>

        <div className="space-y-4">
          {reasons.map((r) => (
            <div key={r.title} className="flex gap-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/[0.04]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[#c2415a] text-white">
                <r.icon size={21} />
              </span>
              <div>
                <h3 className="font-display font-semibold">{r.title}</h3>
                <p className="mt-0.5 text-sm text-ink/60">{r.text}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 rounded-3xl bg-ink p-5 text-white">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <Clock size={21} />
            </span>
            <div>
              <h3 className="font-display font-semibold">Quick replies</h3>
              <p className="mt-0.5 text-sm text-white/60">We usually respond within 2 working days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom band */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-[2rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/bible.jpg" alt="" className="h-64 w-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 bg-gradient-to-r from-ink/90 to-ink/30 p-6 md:p-12">
            <h2 className="max-w-lg font-display text-2xl font-semibold text-white md:text-3xl">Looking for something to read first?</h2>
            <Link href="/#stories" className="btn bg-white text-ink hover:bg-white/90">
              <Newspaper size={17} /> Browse the latest stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
