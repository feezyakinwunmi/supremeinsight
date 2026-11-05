import type { Block, TemplateKey } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { embedUrl } from "@/lib/blocks";
import { Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Inline } from "./Inline";

const CALLOUT_TONES: Record<string, string> = {
  info: "bg-sky-50 border-sky-400 text-sky-950",
  warning: "bg-amber-50 border-amber-400 text-amber-950",
  success: "bg-emerald-50 border-emerald-500 text-emerald-950",
  highlight: "bg-[color:var(--accent)]/10 border-[color:var(--accent)] text-ink",
};

const IMAGE_WIDTH: Record<string, string> = {
  normal: "",
  wide: "md:-mx-12",
  full: "md:-mx-24",
};

function Marker({ style, index, icon }: { style: string; index: number; icon?: string }) {
  switch (style) {
    case "number":
      return (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm font-bold text-white">
          {index + 1}
        </span>
      );
    case "check":
      return (
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
          <Check size={14} strokeWidth={3} />
        </span>
      );
    case "dash":
      return <span className="mt-[0.7em] h-0.5 w-4 shrink-0 bg-[color:var(--accent)]" />;
    case "icon":
      return <Icon name={icon} size={22} className="mt-0.5 shrink-0 text-[color:var(--accent)]" />;
    default:
      return <span className="mt-[0.65em] h-2 w-2 shrink-0 rounded-full bg-[color:var(--accent)]" />;
  }
}

function BlockView({ block, template }: { block: Block; template: TemplateKey }) {
  const t = TEMPLATES[template];

  switch (block.type) {
    case "heading": {
      if (!block.text.trim()) return null;
      // ids let the article sidebar link to each section
      return block.level === 3 ? (
        <h3 id={`h-${block.id}`} className={cn(t.h3, "scroll-mt-28")}>
          {block.text}
        </h3>
      ) : (
        <h2 id={`h-${block.id}`} className={cn(t.h2, "scroll-mt-28")}>
          {block.text}
        </h2>
      );
    }

    case "paragraph": {
      if (!block.text.trim()) return null;
      return (
        <p className={cn(t.p, "whitespace-pre-line")}>
          <Inline text={block.text} />
        </p>
      );
    }

    case "image": {
      if (!block.url) return null;
      return (
        <figure className={IMAGE_WIDTH[block.width]}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt={block.alt || ""} loading="lazy" className="w-full rounded-lg" />
          {block.caption && <figcaption className={t.caption}>{block.caption}</figcaption>}
        </figure>
      );
    }

    case "list": {
      const items = block.items.filter((i) => i.text.trim() || (i.title ?? "").trim());
      if (!items.length) return null;

      if (block.style === "cards") {
        return (
          <div className={cn("grid gap-4", block.columns === 2 && "sm:grid-cols-2")}>
            {items.map((item) => (
              <div key={item.id} className={t.card}>
                <Icon name={item.icon || block.icon} size={26} className="mb-3 text-[color:var(--accent)]" />
                {item.title && <h4 className="mb-1 font-bold text-ink">{item.title}</h4>}
                <p className="text-[0.95rem] leading-relaxed text-ink/75">
                  <Inline text={item.text} />
                </p>
              </div>
            ))}
          </div>
        );
      }

      return (
        <ul className={cn("grid gap-x-8 gap-y-3", block.columns === 2 && "sm:grid-cols-2")}>
          {items.map((item, i) => (
            <li key={item.id} className={cn("flex gap-3", t.p, "!leading-snug")}>
              <Marker style={block.style} index={i} icon={item.icon || block.icon} />
              <span>
                {item.title && <strong>{item.title} </strong>}
                <Inline text={item.text} />
              </span>
            </li>
          ))}
        </ul>
      );
    }

    case "quote": {
      if (!block.text.trim()) return null;
      return (
        <blockquote className={t.quote}>
          <span className={cn("mr-1 text-4xl leading-none align-top", t.quoteMark)}>“</span>
          {block.text}
          {block.cite && <footer className="mt-3 font-sans text-sm not-italic font-semibold text-ink/60">— {block.cite}</footer>}
        </blockquote>
      );
    }

    case "callout": {
      if (!block.text.trim() && !block.title.trim()) return null;
      return (
        <aside className={cn(t.callout, "border", CALLOUT_TONES[block.tone] ?? CALLOUT_TONES.info)}>
          <div className="flex gap-4">
            <Icon name={block.icon} size={24} className="mt-0.5 shrink-0" />
            <div>
              {block.title && <p className="mb-1 font-bold">{block.title}</p>}
              <p className="whitespace-pre-line leading-relaxed">
                <Inline text={block.text} />
              </p>
            </div>
          </div>
        </aside>
      );
    }

    case "video": {
      if (!block.url.trim()) return null;
      const embed = embedUrl(block.url);
      if (!embed) {
        return (
          <a href={block.url} target="_blank" rel="noopener noreferrer" data-track className="font-semibold text-[color:var(--accent)] underline">
            {block.caption || block.url}
          </a>
        );
      }
      return (
        <figure>
          {embed.kind === "video" ? (
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <iframe
                src={embed.src}
                title={block.caption || "Video"}
                className="h-full w-full"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <iframe src={embed.src} title={block.caption || "Audio"} className="w-full rounded-xl" height={block.url.includes("episode") ? 232 : 352} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
          )}
          {block.caption && <figcaption className={t.caption}>{block.caption}</figcaption>}
        </figure>
      );
    }

    case "stats": {
      const items = block.items.filter((i) => i.value.trim());
      if (!items.length) return null;
      return (
        <div className="grid grid-cols-2 gap-6 py-2 sm:grid-cols-3">
          {items.map((s) => (
            <div key={s.id} className={t.stat}>
              <div className={t.statValue}>{s.value}</div>
              <div className="mt-1 text-sm text-ink/60">{s.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case "button": {
      if (!block.label.trim() || !block.url.trim()) return null;
      const external = /^https?:/i.test(block.url);
      return (
        <div className={block.align === "center" ? "text-center" : ""}>
          <a
            href={block.url}
            data-track
            className="inline-block rounded-full bg-[color:var(--accent)] px-7 py-3 font-sans text-sm font-bold text-white transition hover:opacity-90"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {block.label}
          </a>
        </div>
      );
    }

    case "divider": {
      if (block.style === "space") return <div className="h-8" aria-hidden />;
      if (block.style === "dots") {
        return <div className="py-2 text-center text-2xl tracking-[0.6em] text-[color:var(--accent)]" aria-hidden>•••</div>;
      }
      return <hr className="border-ink/15" />;
    }
  }
}

export function BlockRenderer({ blocks, template }: { blocks: Block[]; template: TemplateKey }) {
  const t = TEMPLATES[template];
  return (
    <div className={t.wrap}>
      {blocks.map((block) => (
        <div key={block.id} data-block={block.id} data-type={block.type}>
          <BlockView block={block} template={template} />
        </div>
      ))}
    </div>
  );
}
