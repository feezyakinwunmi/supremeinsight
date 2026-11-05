import type { Metadata } from "next";
import Link from "next/link";
import { getDepartments } from "@/lib/queries";
import { DeptIcon } from "@/lib/departmentIcons";
import { ArrowRight, ArrowUpRight, BadgeCheck, Compass, HeartHandshake, Lightbulb, Mail, Newspaper, Scale } from "lucide-react";

export const metadata: Metadata = { title: "About" };
export const revalidate = 3600;

const values = [
  { icon: BadgeCheck, title: "Credible", text: "Carefully reported, fact-checked stories you can trust and share." },
  { icon: Scale, title: "Independent", text: "Editorially independent. We follow the story, not an agenda." },
  { icon: Compass, title: "Faith-anchored", text: "Every topic viewed through a thoughtful Christian marketplace lens." },
  { icon: Lightbulb, title: "Practical", text: "Insight you can act on, whether you lead a church, a business or a team." },
];

const formats = [
  { icon: Newspaper, label: "Articles & news" },
  { icon: HeartHandshake, label: "Interviews" },
  { icon: Lightbulb, label: "Industry insights" },
  { icon: Compass, label: "Opinion & thought leadership" },
];

export default async function AboutPage() {
  const departments = await getDepartments();
  return (
    <div className="space-y-20 pb-4 md:space-y-28">
      {/* Hero */}
      <section className="container-x pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/church.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
          <div className="relative max-w-2xl px-6 py-16 md:px-12 md:py-24">
            <span className="pill bg-white/10 text-white/85 backdrop-blur">About SupremeInsight</span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl">
              A credible voice for the <span className="text-[#f3b7c0]">Christian marketplace</span>
            </h1>
            <p className="mt-5 text-lg text-white/70">
              We explore the issues, developments and opportunities shaping the Christian marketplace, from the pulpit to the boardroom
              and the classroom to the studio.
            </p>
          </div>
        </div>
      </section>

      {/* Story + image collage */}
      <section className="container-x grid items-center gap-12 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/bible.jpg" alt="An open Bible" className="aspect-[3/4] w-full rounded-3xl object-cover shadow-lift" />
          <div className="space-y-4 pt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/team.jpg" alt="A team working together" className="aspect-square w-full rounded-3xl object-cover shadow-lift" />
            <div className="rounded-3xl bg-brand p-5 text-white">
              <p className="font-display text-4xl font-bold">{departments.length || 10}</p>
              <p className="text-sm text-white/80">departments covering the whole marketplace</p>
            </div>
          </div>
        </div>
        <div>
          <span className="pill bg-brand-soft text-brand">Our story</span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">Where faith meets everyday work</h2>
          <p className="mt-5 text-lg leading-relaxed text-ink/65">
            SupremeInsight is an independent publication for believers who lead, build, teach, create and serve. We publish articles,
            industry insights, interviews, opinion and thought-leadership pieces, always from a Christian marketplace perspective.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {formats.map((f) => (
              <div key={f.label} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-ink/[0.04]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <f.icon size={17} />
                </span>
                <span className="text-sm font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-x">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="pill bg-brand-soft text-brand">What we stand for</span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">Our values</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink/[0.04] transition hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-[#c2415a] text-white shadow-lift">
                <v.icon size={22} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Image band */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-[2rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/workplace.jpg" alt="" className="h-[22rem] w-full object-cover md:h-[26rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
          <blockquote className="absolute inset-x-0 bottom-0 max-w-3xl p-6 md:p-12">
            <p className="font-display text-2xl font-semibold leading-snug text-white md:text-3xl">
              &ldquo;The marketplace is a mission field. We tell the stories of the people serving there.&rdquo;
            </p>
            <footer className="mt-3 text-sm font-medium text-white/70">The SupremeInsight editorial team</footer>
          </blockquote>
        </div>
      </section>

      {/* Departments */}
      <section className="container-x">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="pill bg-brand-soft text-brand">Departments</span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">What we cover</h2>
          </div>
          <Link href="/#stories" className="btn btn-ghost">
            Browse all stories <ArrowRight size={16} />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <li key={d.id}>
              <Link
                href={`/section/${d.slug}`}
                className="group flex h-full gap-4 rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/[0.04] transition hover:-translate-y-1 hover:shadow-lift"
              >
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ background: d.color }}
                >
                  <DeptIcon slug={d.slug} size={21} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2 font-display font-semibold">
                    {d.name}
                    <ArrowUpRight size={17} className="shrink-0 text-ink/30 transition group-hover:text-ink" />
                  </span>
                  {d.description && <span className="mt-1 block text-sm leading-relaxed text-ink/60">{d.description}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="container-x">
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/contact" className="group flex items-center gap-5 rounded-3xl bg-ink p-7 text-white transition hover:bg-ink/90">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <HeartHandshake size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-display text-lg font-semibold">Work with us</span>
              <span className="text-sm text-white/60">Pitch a story, advertise or partner with SupremeInsight.</span>
            </span>
            <ArrowRight className="transition group-hover:translate-x-1" />
          </Link>
          <Link href="/newsletter" className="group flex items-center gap-5 rounded-3xl bg-brand p-7 text-white transition hover:bg-brand-dark">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Mail size={24} />
            </span>
            <span className="flex-1">
              <span className="block font-display text-lg font-semibold">Join the newsletter</span>
              <span className="text-sm text-white/70">New stories in the topics you choose.</span>
            </span>
            <ArrowRight className="transition group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
