"use client";
import { adminHref } from "@/lib/adminPath";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Block, Department, Post, PostStatus, Profile, TemplateKey } from "@/lib/types";
import { TEMPLATES, TEMPLATE_KEYS } from "@/lib/templates";
import { readingMinutes } from "@/lib/blocks";
import { slugify, formatDate } from "@/lib/utils";
import { PostView, type PostViewData } from "@/components/blocks/PostView";
import { BlockList } from "./BlockList";
import { ImageField } from "./ImageField";
import { ArrowLeft, Check, ChevronDown, Eye, Loader2, Pencil, Save, Send, Upload } from "lucide-react";

type Props = {
  initial: Post | null;
  departments: Department[];
  profile: Pick<Profile, "id" | "full_name" | "role">;
};

const STATUS_STYLE: Record<PostStatus, string> = {
  draft: "bg-ink/10 text-ink/70",
  review: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  archived: "bg-ink/10 text-ink/50",
};

const STATUS_LABEL: Record<PostStatus, string> = {
  draft: "Draft",
  review: "In review",
  published: "Published",
  archived: "Archived",
};

type Fields = {
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  departmentId: string;
  template: TemplateKey;
  blocks: Block[];
  tagsText: string;
  featured: boolean;
  seoTitle: string;
  seoDesc: string;
};

const snap = (f: Fields) => JSON.stringify(f);

export function PostEditor({ initial, departments, profile }: Props) {
  const supabase = createClient();
  const isEditor = profile.role === "editor" || profile.role === "admin";

  const init: Fields = {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    cover: initial?.cover_image ?? "",
    departmentId: initial?.department_id ?? "",
    template: initial?.template ?? "editorial",
    blocks: initial?.blocks ?? [],
    tagsText: (initial?.tags ?? []).join(", "),
    featured: initial?.featured ?? false,
    seoTitle: initial?.seo_title ?? "",
    seoDesc: initial?.seo_description ?? "",
  };

  const [postId, setPostId] = useState<string | null>(initial?.id ?? null);
  const [status, setStatus] = useState<PostStatus>(initial?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState<string | null>(initial?.published_at ?? null);
  const [title, setTitle] = useState(init.title);
  const [slug, setSlug] = useState(init.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [excerpt, setExcerpt] = useState(init.excerpt);
  const [cover, setCover] = useState(init.cover);
  const [departmentId, setDepartmentId] = useState(init.departmentId);
  const [template, setTemplate] = useState<TemplateKey>(init.template);
  const [blocks, setBlocks] = useState<Block[]>(init.blocks);
  const [tagsText, setTagsText] = useState(init.tagsText);
  const [featured, setFeatured] = useState(init.featured);
  const [seoTitle, setSeoTitle] = useState(init.seoTitle);
  const [seoDesc, setSeoDesc] = useState(init.seoDesc);
  const [showSeo, setShowSeo] = useState(false);

  const [saved, setSaved] = useState(snap(init));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"write" | "preview">("write");

  const current: Fields = { title, slug, excerpt, cover, departmentId, template, blocks, tagsText, featured, seoTitle, seoDesc };
  const dirty = snap(current) !== saved;

  // Writers can only change their own unpublished posts; editors and admins can change anything.
  const canEdit = isEditor || !postId || (initial?.author_id === profile.id && (status === "draft" || status === "review"));

  const dept = departments.find((d) => d.id === departmentId) ?? null;
  const preview: PostViewData = {
    title,
    excerpt: excerpt || null,
    cover_image: cover || null,
    template,
    blocks,
    tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    reading_minutes: readingMinutes(blocks),
    published_at: publishedAt,
  };

  function onTitle(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function persist(nextStatus: PostStatus, silent = false): Promise<boolean> {
    if (!title.trim()) {
      if (!silent) setError("Add a title before saving.");
      return false;
    }
    const finalSlug = slugify(slug || title);
    if (!finalSlug) {
      if (!silent) setError("The web address (slug) can't be empty.");
      return false;
    }

    setError("");
    if (!silent) setBusy(nextStatus);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      cover_image: cover.trim() || null,
      department_id: departmentId || null,
      template,
      blocks,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      featured: isEditor ? featured : false,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDesc.trim() || null,
      reading_minutes: readingMinutes(blocks),
      status: nextStatus,
    };

    const result = postId
      ? await supabase.from("posts").update(payload).eq("id", postId).select("id, slug, status, published_at").single()
      : await supabase
          .from("posts")
          .insert({ ...payload, author_id: profile.id })
          .select("id, slug, status, published_at")
          .single();
    const { data, error: err } = result;

    if (!silent) setBusy(null);

    if (err || !data) {
      const msg =
        err?.code === "23505"
          ? "Another post already uses this web address (slug). Change the slug and save again."
          : err?.message ?? "Could not save.";
      setError(silent ? `Autosave failed: ${msg}` : msg);
      return false;
    }

    setSlug(data.slug as string);
    setSlugTouched(true);
    setStatus(data.status as PostStatus);
    setPublishedAt((data.published_at as string | null) ?? null);
    setSaved(snap({ ...current, slug: data.slug as string }));

    if (!postId) {
      setPostId(data.id as string);
      window.history.replaceState(null, "", adminHref(`/posts/${data.id}`));
    }
    if (!silent) {
      setNotice(nextStatus === "published" ? "Published ✓" : nextStatus === "review" ? "Sent for review ✓" : "Saved ✓");
      window.setTimeout(() => setNotice(""), 2500);
    }
    // First time a post goes live: email subscribers who follow its department (each post is only emailed once)
    if (nextStatus === "published" && !silent) void notifySubscribers(data.id as string);
    return true;
  }

  async function notifySubscribers(id: string) {
    try {
      const res = await fetch("/api/newsletter/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id }),
      });
      const body = (await res.json().catch(() => ({}))) as { sent?: number; skipped?: string; error?: string };
      if (!res.ok) return setError(`Published, but the newsletter email failed: ${body.error ?? res.status}`);
      if (body.skipped === "not-configured") setNotice("Published ✓ (newsletter email is not set up yet)");
      else if (body.sent) setNotice(`Published ✓ Emailed ${body.sent} subscriber${body.sent === 1 ? "" : "s"}`);
      else return;
      window.setTimeout(() => setNotice(""), 5000);
    } catch {
      setError("Published, but the newsletter email could not be sent.");
    }
  }

  // keep latest versions available to timers
  const persistRef = useRef(persist);
  persistRef.current = persist;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const statusRef = useRef(status);
  statusRef.current = status;

  // Autosave drafts every 25 seconds
  useEffect(() => {
    if (!canEdit) return;
    const t = window.setInterval(() => {
      const s = statusRef.current;
      if (dirtyRef.current && (s === "draft" || s === "review")) void persistRef.current(s, true);
    }, 25000);
    return () => window.clearInterval(t);
  }, [canEdit]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const saveStatus: PostStatus = status === "published" || status === "review" ? status : "draft";

  return (
    <div>
      {/* ---------- top bar ---------- */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur">
        <Link href={adminHref("/posts")} className="btn btn-ghost !px-3" title="Back to posts">
          <ArrowLeft size={16} />
        </Link>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>
        <span className="text-xs text-ink/50">
          {busy ? "Saving…" : dirty ? "Unsaved changes" : postId ? "All changes saved" : ""}
          {status === "published" && publishedAt ? ` · Live since ${formatDate(publishedAt)}` : ""}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {notice && <span className="text-sm font-bold text-emerald-700">{notice}</span>}

          <div className="flex overflow-hidden rounded-full border border-ink/15 2xl:hidden">
            <button type="button" onClick={() => setTab("write")} className={`px-3 py-1.5 text-xs font-bold ${tab === "write" ? "bg-ink text-white" : "bg-white"}`}>
              <Pencil size={12} className="mr-1 inline" /> Write
            </button>
            <button type="button" onClick={() => setTab("preview")} className={`px-3 py-1.5 text-xs font-bold ${tab === "preview" ? "bg-ink text-white" : "bg-white"}`}>
              <Eye size={12} className="mr-1 inline" /> Preview
            </button>
          </div>

          {canEdit && (
            <>
              <button type="button" className="btn btn-ghost" disabled={!!busy || !dirty} onClick={() => persist(saveStatus)}>
                {busy === saveStatus ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {status === "published" ? "Save changes" : "Save draft"}
              </button>

              {!isEditor && status === "draft" && (
                <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => persist("review")}>
                  {busy === "review" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit for review
                </button>
              )}

              {isEditor && status !== "published" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!!busy}
                  onClick={() => {
                    if (window.confirm("Publish this post now? It becomes visible to everyone, and newsletter subscribers who follow this topic get an email.")) void persist("published");
                  }}
                >
                  {busy === "published" ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Publish
                </button>
              )}

              {isEditor && status === "published" && (
                <button type="button" className="btn btn-danger" disabled={!!busy} onClick={() => persist("draft")}>
                  Unpublish
                </button>
              )}
            </>
          )}
          {status === "published" && (
            <Link href={`/post/${slug}`} target="_blank" className="btn btn-ghost">
              View live
            </Link>
          )}
        </div>
      </div>

      {error && <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {!canEdit && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          This post is {STATUS_LABEL[status].toLowerCase()}. Ask an editor to make changes.
        </div>
      )}

      <div className="grid 2xl:grid-cols-2">
        {/* ---------- writing column ---------- */}
        <section className={`space-y-6 p-4 md:p-6 ${tab === "preview" ? "hidden 2xl:block" : ""} ${canEdit ? "" : "pointer-events-none opacity-70"}`}>
          <div>
            <input
              value={title}
              onChange={(e) => onTitle(e.target.value)}
              placeholder="Post title"
              className="w-full bg-transparent font-display text-3xl font-bold leading-tight outline-none placeholder:text-ink/25 md:text-4xl"
            />
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Short summary shown on cards and in search results"
              className="mt-3 w-full resize-none bg-transparent text-lg text-ink/70 outline-none placeholder:text-ink/25"
            />
          </div>

          {/* Settings */}
          <div className="space-y-5 rounded-xl border border-ink/10 bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Department</label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="field">
                  <option value="">— Choose a department —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="stewardship, startups, AI" className="field" />
              </div>
            </div>

            <div>
              <label className="label">Look &amp; feel (template)</label>
              <div className="grid gap-2 sm:grid-cols-3">
                {TEMPLATE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTemplate(key)}
                    className={`rounded-lg border p-3 text-left transition ${template === key ? "border-brand bg-brand/5 ring-2 ring-brand/20" : "border-ink/15 hover:bg-ink/5"}`}
                  >
                    <span className="flex items-center justify-between text-sm font-bold">
                      {TEMPLATES[key].name}
                      {template === key && <Check size={14} className="text-brand" />}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-ink/55">{TEMPLATES[key].description}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink/50">You can switch template any time — your content and block order stay exactly as they are.</p>
            </div>

            <div>
              <label className="label">Cover image</label>
              <ImageField value={cover} onChange={setCover} userId={profile.id} />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label className="label">Web address</label>
                <div className="flex items-center rounded-lg border border-ink/15 bg-white focus-within:border-brand">
                  <span className="pl-3 text-sm text-ink/40">/post/</span>
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setSlugTouched(true);
                    }}
                    placeholder="auto-from-title"
                    className="w-full rounded-lg bg-transparent px-1 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              {isEditor && (
                <label className="flex items-center gap-2 pb-2 text-sm font-semibold">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-brand" />
                  Feature on homepage
                </label>
              )}
            </div>

            <div>
              <button type="button" onClick={() => setShowSeo((s) => !s)} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ink/55 hover:text-ink">
                <ChevronDown size={14} className={showSeo ? "rotate-180" : ""} /> Search engine settings
              </button>
              {showSeo && (
                <div className="mt-3 space-y-3">
                  <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO title (defaults to the post title)" className="field" />
                  <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} placeholder="SEO description (defaults to the summary)" className="field" />
                </div>
              )}
            </div>
          </div>

          {/* Blocks */}
          <div>
            <div className="mb-3 flex items-end justify-between">
              <h2 className="font-display text-xl font-bold">Content</h2>
              <span className="text-xs text-ink/50">
                {blocks.length} block{blocks.length === 1 ? "" : "s"} · {readingMinutes(blocks)} min read
              </span>
            </div>
            <BlockList blocks={blocks} onChange={setBlocks} userId={profile.id} />
          </div>
        </section>

        {/* ---------- live preview column ---------- */}
        <section className={`border-ink/10 bg-white 2xl:border-l ${tab === "write" ? "hidden 2xl:block" : ""}`}>
          <div className="sticky top-[57px] z-20 flex items-center gap-2 border-b border-ink/10 bg-white/95 px-4 py-2 backdrop-blur">
            <Eye size={14} className="text-ink/50" />
            <span className="text-xs font-bold uppercase tracking-wider text-ink/55">Live preview</span>
            <div className="ml-auto flex gap-1">
              {TEMPLATE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTemplate(key)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${template === key ? "bg-brand text-white" : "bg-ink/5 hover:bg-ink/10"}`}
                >
                  {TEMPLATES[key].name}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-paper">
            <PostView post={preview} department={dept ? { name: dept.name, color: dept.color } : null} authorName={profile.full_name} />
          </div>
        </section>
      </div>
    </div>
  );
}
