import type { CSSProperties } from "react";
import type { Block, TemplateKey } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { formatDate } from "@/lib/utils";
import { BlockRenderer } from "./BlockRenderer";
import { Clock } from "lucide-react";

export type PostViewData = {
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  template: TemplateKey;
  blocks: Block[];
  tags: string[];
  reading_minutes: number;
  published_at: string | null;
};

// Used by the public post page AND the live preview in the editor,
// so what the author sees is exactly what readers get.
export function PostView({
  post,
  department,
  authorName,
  aside,
  footer,
}: {
  post: PostViewData;
  department: { name: string; color: string } | null;
  authorName: string | null;
  /** Optional right-hand sidebar (public post page only; the editor preview has none). */
  aside?: React.ReactNode;
  /** Optional content under the article body, e.g. the author box. */
  footer?: React.ReactNode;
}) {
  const t = TEMPLATES[post.template];
  const accent = department?.color ?? "#7a1f2b";
  const title = post.title.trim() || "Untitled post";

  const meta = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-sm opacity-80">
      {authorName && <span className="font-semibold">By {authorName}</span>}
      {post.published_at && <span>{formatDate(post.published_at)}</span>}
      <span className="inline-flex items-center gap-1">
        <Clock size={14} /> {post.reading_minutes} min read
      </span>
    </div>
  );

  const badge = department && (
    <span
      className="inline-block rounded-full px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-white"
      style={{ background: accent }}
    >
      {department.name}
    </span>
  );

  const body = (
    <>
      <BlockRenderer blocks={post.blocks} template={post.template} />
      {post.tags.length > 0 && (
        <div className="mx-auto mt-12 flex max-w-[44rem] flex-wrap gap-2 border-t border-ink/10 pt-6">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-ink/5 px-3 py-1 font-sans text-xs font-semibold text-ink/70">
              #{tag}
            </span>
          ))}
        </div>
      )}
      {footer && <div className="mx-auto mt-10 max-w-[44rem]">{footer}</div>}
    </>
  );

  return (
    <article style={{ "--accent": accent } as CSSProperties} className="overflow-x-clip">
      {t.header === "cover" ? (
        <header className="relative mb-12 bg-ink text-white">
          {post.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          )}
          <div className="relative mx-auto flex min-h-[26rem] max-w-4xl flex-col justify-end gap-4 px-5 pb-10 pt-24">
            {badge}
            <h1 className="font-sans text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">{title}</h1>
            {post.excerpt && <p className="max-w-2xl text-lg text-white/85 md:text-xl">{post.excerpt}</p>}
            {meta}
          </div>
        </header>
      ) : (
        <header className={`mx-auto mb-10 max-w-3xl px-5 pt-10 md:pt-16 ${t.header === "centered" ? "text-center" : ""}`}>
          <div className={`mb-5 ${t.header === "centered" ? "flex justify-center" : ""}`}>{badge}</div>
          <h1
            className={
              t.header === "centered"
                ? "font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl"
                : "font-sans text-3xl font-semibold leading-tight md:text-4xl"
            }
          >
            {title}
          </h1>
          {post.excerpt && (
            <p className={`mt-5 text-lg text-ink/70 md:text-xl`}>{post.excerpt}</p>
          )}
          <div className={`mt-6 ${t.header === "centered" ? "flex justify-center" : ""}`}>{meta}</div>
          {post.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.cover_image} alt="" className="mt-8 w-full rounded-xl" />
          )}
        </header>
      )}

      {aside ? (
        <div className="container-x grid gap-12 pb-16 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* wide/full images stay inside the text column when there is a sidebar */}
          <div id="post-body" className="min-w-0 lg:[&_figure]:mx-0">
            {body}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-4 lg:[scrollbar-width:thin]">
            {aside}
          </aside>
        </div>
      ) : (
        <div className="px-5 pb-16" id="post-body">
          {body}
        </div>
      )}
    </article>
  );
}
