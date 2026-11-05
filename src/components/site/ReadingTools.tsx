"use client";

import { useEffect, useRef, useState } from "react";
import { clearSpot, loadSpots, saveSpot, type SavedSpot } from "@/lib/readingProgress";
import { BookmarkCheck, Check, Facebook, Link2, Linkedin, ListOrdered, MessageCircle, Play, Share2, Twitter, X } from "lucide-react";

type PostInfo = { slug: string; title: string; cover: string | null; department: string | null; color: string | null };

function bodyPercent(): number {
  const body = document.getElementById("post-body");
  if (!body) return 0;
  const rect = body.getBoundingClientRect();
  const total = rect.height - window.innerHeight * 0.6;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((-rect.top / total) * 100)));
}

/** Thin bar at the very top showing how far through the article you are. */
export function ReadingProgressBar({ color }: { color: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setPct(bodyPercent()));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden>
      <div className="h-full transition-[width] duration-150 ease-out" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/**
 * Saves the reader's position as they scroll, and when they come back offers
 * "Continue where you left off". Finished articles are forgotten.
 */
export function ResumeReading({ post }: { post: PostInfo }) {
  const [saved, setSaved] = useState<SavedSpot | null>(null);
  const [visible, setVisible] = useState(false);
  const ready = useRef(false);

  // On arrival: look for a saved spot
  useEffect(() => {
    const spot = loadSpots()[post.slug];
    if (spot && spot.percent >= 5 && spot.percent < 95 && !window.location.hash) {
      setSaved(spot);
      setVisible(true);
    }
    // don't overwrite the saved spot until the reader actually starts scrolling
    const t = window.setTimeout(() => (ready.current = true), 1500);
    return () => window.clearTimeout(t);
  }, [post.slug]);

  // While reading: remember the first block on screen
  useEffect(() => {
    let timer = 0;
    const onScroll = () => {
      if (!ready.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const percent = bodyPercent();
        if (percent >= 95) return clearSpot(post.slug);
        if (percent < 5) return;
        const blocks = Array.from(document.querySelectorAll<HTMLElement>("#post-body [data-block]"));
        const first = blocks.find((b) => b.getBoundingClientRect().bottom > 120);
        saveSpot({ ...post, blockId: first?.dataset.block ?? null, percent, updatedAt: Date.now() });
        setVisible(false); // they've started reading again
      }, 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [post]);

  function resume() {
    if (!saved) return;
    const el = saved.blockId ? document.querySelector<HTMLElement>(`[data-block="${saved.blockId}"]`) : null;
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: y, behavior: "smooth" });
      el.classList.add("resume-flash");
      window.setTimeout(() => el.classList.remove("resume-flash"), 2200);
    }
    setVisible(false);
  }

  function startOver() {
    clearSpot(post.slug);
    setVisible(false);
  }

  if (!visible || !saved) return null;

  return (
    <div role="dialog" aria-label="Continue reading" className="animate-fade-up fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:left-6 sm:translate-x-0">
      <div className="flex items-center gap-4 rounded-2xl bg-ink p-4 pr-3 text-white shadow-lift ring-1 ring-white/10">
        <div className="relative h-12 w-12 shrink-0">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={post.color ?? "#f3b7c0"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(saved.percent / 100) * 97.4} 97.4`}
            />
          </svg>
          <BookmarkCheck size={17} className="absolute inset-0 m-auto" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-semibold">Welcome back!</p>
          <p className="text-xs text-white/60">You were {saved.percent}% through this article.</p>
          <div className="mt-2 flex gap-2">
            <button onClick={resume} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-white/90">
              <Play size={12} /> Continue reading
            </button>
            <button onClick={startOver} className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white">
              Start over
            </button>
          </div>
        </div>
        <button onClick={() => setVisible(false)} aria-label="Dismiss" className="self-start rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

/** "On this page" list that highlights the section you're reading. */
export function TableOfContents({ items }: { items: { id: string; text: string; level: 2 | 3 }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  useEffect(() => {
    const els = items.map((i) => document.getElementById(`h-${i.id}`)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id.slice(2));
      },
      { rootMargin: "-90px 0px -65% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  if (items.length < 2) return null;
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/[0.04]">
      <h3 className="mb-3 flex items-center gap-2 font-display text-[0.95rem] font-semibold">
        <ListOrdered size={16} className="text-brand" /> On this page
      </h3>
      <ul className="space-y-0.5 border-l-2 border-ink/[0.06]">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#h-${i.id}`}
              className={`-ml-0.5 block border-l-2 py-1.5 text-sm transition ${i.level === 3 ? "pl-6" : "pl-3"} ${
                active === i.id ? "border-brand font-semibold text-ink" : "border-transparent text-ink/55 hover:text-ink"
              }`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Share links + copy link button. */
export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href.split("#")[0]), []);

  const enc = encodeURIComponent;
  const links = [
    { label: "Share on WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${enc(`${title} ${url}`)}`, bg: "#25D366" },
    { label: "Share on X", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, bg: "#111114" },
    { label: "Share on Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, bg: "#1877F2" },
    { label: "Share on LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, bg: "#0A66C2" },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: ignore
    }
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/[0.04]">
      <h3 className="mb-3 flex items-center gap-2 font-display text-[0.95rem] font-semibold">
        <Share2 size={16} className="text-brand" /> Share this story
      </h3>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={l.label}
            title={l.label}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:-translate-y-0.5 hover:opacity-90"
            style={{ background: l.bg }}
          >
            <l.icon size={17} />
          </a>
        ))}
        <button
          onClick={copy}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-ink/10 px-3 text-xs font-semibold text-ink/70 transition hover:border-ink/30 hover:text-ink"
        >
          {copied ? <Check size={15} className="text-emerald-600" /> : <Link2 size={15} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
