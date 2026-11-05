import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getDepartments, getLatestPosts } from "@/lib/queries";
import { PostCard } from "@/components/site/PostCard";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const revalidate = 60;

const PAGE_SIZE = 12;

async function findDepartment(slug: string) {
  const departments = await getDepartments();
  return { dept: departments.find((d) => d.slug === slug) ?? null, departments };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { dept } = await findDepartment(slug);
  if (!dept) return {};
  return { title: dept.name, description: dept.description ?? undefined };
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const { dept, departments } = await findDepartment(slug);
  if (!dept) notFound();

  const pageNo = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  // fetch one extra to know whether there is a next page
  const rows = await getLatestPosts(PAGE_SIZE + 1, dept.id, (pageNo - 1) * PAGE_SIZE);
  const posts = rows.slice(0, PAGE_SIZE);
  const hasNext = rows.length > PAGE_SIZE;
  const lead = pageNo === 1 ? posts[0] : undefined;
  const others = lead ? posts.slice(1) : posts;

  return (
    <div className="container-x space-y-12 py-8 md:py-10">
      {/* Banner */}
      <header
        className="relative overflow-hidden rounded-[2rem] px-6 py-12 text-white md:px-12 md:py-16"
        style={{ background: `radial-gradient(130% 140% at 0% 0%, ${dept.color}, #111114 80%)` }}
      >
        <span className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <span className="pill bg-white/15 text-white/90">Topic</span>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl">{dept.name}</h1>
            {dept.description && <p className="mt-4 max-w-xl text-lg text-white/70">{dept.description}</p>}
          </div>
          <div className="rounded-2xl bg-white/[0.07] p-5 backdrop-blur">
            <p className="mb-3 font-display text-sm font-semibold">Get {dept.name} stories by email</p>
            <NewsletterSignup
              departments={departments.map((d) => ({ id: d.id, name: d.name, color: d.color }))}
              defaultDepartmentId={dept.id}
              showTopics={false}
              tone="dark"
            />
          </div>
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/15 py-20 text-center">
          <p className="font-display text-lg font-semibold">No stories here yet</p>
          <p className="mt-1 text-ink/55">Subscribe above and we&apos;ll tell you when the first one is published.</p>
        </div>
      ) : (
        <>
          {lead && <PostCard post={lead} variant="wide" />}
          {others.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </>
      )}

      {(pageNo > 1 || hasNext) && (
        <nav className="flex justify-between">
          {pageNo > 1 ? (
            <Link href={`/section/${slug}?page=${pageNo - 1}`} className="btn btn-ghost">
              <ArrowLeft size={16} /> Newer
            </Link>
          ) : (
            <span />
          )}
          {hasNext && (
            <Link href={`/section/${slug}?page=${pageNo + 1}`} className="btn btn-ghost">
              Older <ArrowRight size={16} />
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
