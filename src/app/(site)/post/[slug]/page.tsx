import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getDepartments, getLatestPosts, getPostBySlug, getRelatedPosts } from "@/lib/queries";
import { ReadingProgressBar, ResumeReading, ShareButtons, TableOfContents } from "@/components/site/ReadingTools";
import { ArrowRight, Layers, Mail, Newspaper, PenLine } from "lucide-react";
import type { Block } from "@/lib/types";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { PostView } from "@/components/blocks/PostView";
import { Tracker } from "@/components/Tracker";
import { PostCard } from "@/components/site/PostCard";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPostBySlug(slug);
  if (!found) return {};
  const { post } = found;
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/post/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
    twitter: { card: post.cover_image ? "summary_large_image" : "summary", title, description },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getPostBySlug(slug);
  if (!found) notFound();

  const { post, department, author } = found;
  const [sameTopic, latest, allDepartments] = await Promise.all([getRelatedPosts(post, 4), getLatestPosts(10), getDepartments()]);

  // Sidebar: same-department stories first, topped up with the newest ones
  const others = latest.filter((p) => p.id !== post.id);
  const related = [...sameTopic, ...others.filter((p) => !sameTopic.some((s) => s.id === p.id))].slice(0, 4);
  // Bottom: more stories the reader hasn't just seen in the sidebar
  const more = others.filter((p) => !related.some((r) => r.id === p.id)).slice(0, 3);

  const headings = post.blocks
    .filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading" && Boolean(b.text.trim()))
    .map((b) => ({ id: b.id, text: b.text, level: b.level }));

  const accent = department?.color ?? "#8a1c2c";

  const authorBox = (
    <div className="flex gap-5 rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink/[0.04]">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand font-display text-xl font-semibold text-white">
        {author?.full_name ? author.full_name.trim().charAt(0).toUpperCase() : <PenLine size={22} />}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Written by</p>
        <p className="mt-1 font-display text-lg font-semibold">{author?.full_name ?? "The SupremeInsight team"}</p>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/65">
          {author?.bio ?? "Independent reporting and insight for the Christian marketplace."}
        </p>
      </div>
    </div>
  );

  const sidebar = (
    <>
      <TableOfContents items={headings} />

      {related.length > 0 && (
        <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/[0.04]">
          <h3 className="mb-2 flex items-center gap-2 font-display text-[0.95rem] font-semibold">
            <Layers size={16} className="text-brand" /> Related articles
          </h3>
          <div className="-mx-2 space-y-1">
            {related.map((p) => (
              <PostCard key={p.id} post={p} variant="mini" />
            ))}
          </div>
          {department && (
            <Link
              href={`/section/${department.slug}`}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-ink/10 py-2.5 text-sm font-semibold transition hover:border-ink/30"
            >
              More in {department.name} <ArrowRight size={15} />
            </Link>
          )}
        </div>
      )}

      <ShareButtons title={post.title} />

      <div className="relative overflow-hidden rounded-3xl bg-ink p-5">
        <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/60 blur-3xl" />
        <div className="relative">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
            <Mail size={18} />
          </span>
          <h3 className="mt-3 font-display text-lg font-semibold text-white">
            {department ? `Get new ${department.name} stories` : "Get new stories by email"}
          </h3>
          <p className="mb-4 mt-1 text-sm text-white/60">One email when a new story is published.</p>
          <NewsletterSignup
            departments={allDepartments.map((d) => ({ id: d.id, name: d.name, color: d.color }))}
            defaultDepartmentId={department?.id}
            showTopics={false}
            tone="dark"
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      <Tracker postId={post.id} />
      <ReadingProgressBar color={accent} />
      <ResumeReading
        post={{
          slug: post.slug,
          title: post.title,
          cover: post.cover_image,
          department: department?.name ?? null,
          color: department?.color ?? null,
        }}
      />
      <PostView post={post} department={department} authorName={author?.full_name ?? null} aside={sidebar} footer={authorBox} />

      {more.length > 0 && (
        <section className="container-x pb-6">
          <h2 className="mb-8 flex items-center gap-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Newspaper size={19} />
            </span>
            More from SupremeInsight
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
