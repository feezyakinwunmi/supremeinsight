import Link from "next/link";
import type { PostCardData } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

function Cover({ post, className }: { post: PostCardData; className: string }) {
  const color = post.department?.color ?? "#8a1c2c";
  if (post.cover_image) {
    return (
      <div className={`${className} overflow-hidden bg-ink/5`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover_image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
    );
  }
  // No image: a soft gradient tile in the department colour
  return (
    <div
      className={`${className} relative overflow-hidden`}
      style={{ background: `radial-gradient(120% 120% at 0% 0%, ${color}, #111114 75%)` }}
    >
      <span className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <span className="absolute left-4 top-4 font-display text-xs font-semibold uppercase tracking-wider text-white/70">
        {post.department?.name ?? "SupremeInsight"}
      </span>
    </div>
  );
}

export function Tag({ post, onDark = false }: { post: PostCardData; onDark?: boolean }) {
  if (!post.department) return null;
  if (onDark) {
    return <span className="pill bg-white/15 text-white backdrop-blur">{post.department.name}</span>;
  }
  return (
    <span className="pill" style={{ background: `${post.department.color}14`, color: post.department.color }}>
      {post.department.name}
    </span>
  );
}

function Meta({ post, onDark = false }: { post: PostCardData; onDark?: boolean }) {
  const parts = [post.published_at ? formatDate(post.published_at) : null, `${post.reading_minutes} min read`].filter(Boolean);
  const initial = (post.author?.full_name ?? "").trim().charAt(0).toUpperCase();
  return (
    <div className={`flex items-center gap-2.5 text-xs ${onDark ? "text-white/70" : "text-ink/50"}`}>
      {post.author?.full_name && (
        <>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ${
              onDark ? "bg-white/20 text-white" : "bg-ink/[0.07] text-ink/70"
            }`}
          >
            {initial}
          </span>
          <span className={`font-medium ${onDark ? "text-white" : "text-ink/75"}`}>{post.author.full_name}</span>
          <span aria-hidden>&middot;</span>
        </>
      )}
      <span>{parts.join(" · ")}</span>
    </div>
  );
}

export function PostCard({
  post,
  variant = "default",
}: {
  post: PostCardData;
  variant?: "default" | "hero" | "mini" | "wide";
}) {
  const href = `/post/${post.slug}`;

  // Big image card with the title on top of the photo
  if (variant === "hero") {
    return (
      <Link href={href} className="group relative block h-full min-h-[26rem] overflow-hidden rounded-3xl bg-ink shadow-lift md:min-h-[34rem]">
        <Cover post={post} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-4 p-6 md:p-10">
          <Tag post={post} onDark />
          <h2 className="max-w-3xl font-display text-3xl font-semibold leading-[1.15] tracking-tight text-white md:text-5xl">
            {post.title}
          </h2>
          {post.excerpt && <p className="line-clamp-2 max-w-2xl text-base text-white/75 md:text-lg">{post.excerpt}</p>}
          <Meta post={post} onDark />
        </div>
        <span className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-white group-hover:text-ink">
          <ArrowUpRight size={20} />
        </span>
      </Link>
    );
  }

  // Small thumbnail + title, for side lists
  if (variant === "mini") {
    return (
      <Link href={href} className="group flex items-center gap-4 rounded-2xl p-2 transition hover:bg-ink/[0.03]">
        <Cover post={post} className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
        <div className="min-w-0 flex-1 space-y-1.5">
          {post.department && (
            <span className="text-xs font-semibold" style={{ color: post.department.color }}>
              {post.department.name}
            </span>
          )}
          <h3 className="line-clamp-2 font-display text-[0.95rem] font-semibold leading-snug transition group-hover:text-brand">{post.title}</h3>
          <p className="text-xs text-ink/45">
            {post.published_at ? formatDate(post.published_at) : ""} &middot; {post.reading_minutes} min
          </p>
        </div>
      </Link>
    );
  }

  // Horizontal card: image left, text right
  if (variant === "wide") {
    return (
      <Link
        href={href}
        className="group grid overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink/[0.04] transition hover:-translate-y-1 hover:shadow-lift md:grid-cols-2"
      >
        <Cover post={post} className="aspect-[16/10] w-full md:aspect-auto md:min-h-[20rem]" />
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <div>
            <Tag post={post} />
          </div>
          <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{post.title}</h3>
          {post.excerpt && <p className="line-clamp-3 text-ink/60">{post.excerpt}</p>}
          <Meta post={post} />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink/[0.04] transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <Cover post={post} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        <div>
          <Tag post={post} />
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight transition group-hover:text-brand md:text-xl">
          {post.title}
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-ink/60">{post.excerpt}</p>}
        <div className="mt-auto pt-2">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}
