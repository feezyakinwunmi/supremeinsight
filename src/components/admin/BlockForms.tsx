"use client";

import { useRef, useState } from "react";
import type { Block, BlockType, ListStyle } from "@/lib/types";
import { embedUrl } from "@/lib/blocks";
import { uid } from "@/lib/utils";
import { IconPicker } from "./IconPicker";
import { ImageField } from "./ImageField";
import { Bold, Italic, Link2, Plus, X } from "lucide-react";

type B<T extends BlockType> = Extract<Block, { type: T }>;
type Props<T extends BlockType> = { block: B<T>; onChange: (b: Block) => void; userId: string };

// ---- text area with Bold / Italic / Link helpers -------------------------

function RichText({
  value,
  onChange,
  placeholder,
  minRows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after: string, fallback: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || fallback;
    onChange(value.slice(0, start) + before + selected + after + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function addLink() {
    const href = window.prompt("Link address (https://…)");
    if (!href) return;
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const text = value.slice(start, end) || "link text";
    onChange(value.slice(0, start) + `[${text}](${href.trim()})` + value.slice(end));
  }

  const rows = Math.max(minRows, value.split("\n").length + 1);

  return (
    <div>
      <div className="mb-1 flex gap-1">
        <button type="button" title="Bold" onClick={() => wrap("**", "**", "bold text")} className="rounded border border-ink/15 bg-white p-1.5 hover:bg-ink/5">
          <Bold size={14} />
        </button>
        <button type="button" title="Italic" onClick={() => wrap("*", "*", "italic text")} className="rounded border border-ink/15 bg-white p-1.5 hover:bg-ink/5">
          <Italic size={14} />
        </button>
        <button type="button" title="Add link" onClick={addLink} className="rounded border border-ink/15 bg-white p-1.5 hover:bg-ink/5">
          <Link2 size={14} />
        </button>
      </div>
      <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="field resize-y leading-relaxed" />
    </div>
  );
}

// ---- individual block forms ----------------------------------------------

function HeadingForm({ block, onChange }: Props<"heading">) {
  return (
    <div className="flex gap-2">
      <input value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Heading" className="field !text-base font-bold" />
      <select value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 })} className="field !w-28">
        <option value={2}>Large</option>
        <option value={3}>Small</option>
      </select>
    </div>
  );
}

function ParagraphForm({ block, onChange }: Props<"paragraph">) {
  return <RichText value={block.text} onChange={(text) => onChange({ ...block, text })} placeholder="Write your paragraph…" />;
}

function ImageForm({ block, onChange, userId }: Props<"image">) {
  return (
    <div className="space-y-3">
      <ImageField value={block.url} onChange={(url) => onChange({ ...block, url })} userId={userId} />
      <div className="grid gap-2 sm:grid-cols-[1fr_9rem]">
        <input value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption (optional)" className="field" />
        <select value={block.width} onChange={(e) => onChange({ ...block, width: e.target.value as B<"image">["width"] })} className="field">
          <option value="normal">Normal width</option>
          <option value="wide">Wide</option>
          <option value="full">Extra wide</option>
        </select>
      </div>
      <input value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} placeholder="Describe the image (for accessibility)" className="field" />
    </div>
  );
}

const LIST_STYLES: { key: ListStyle; label: string }[] = [
  { key: "bullet", label: "• Bullets" },
  { key: "number", label: "1. Numbers" },
  { key: "check", label: "✓ Checkmarks" },
  { key: "dash", label: "— Dashes" },
  { key: "icon", label: "★ Icons" },
  { key: "cards", label: "▦ Cards" },
];

function ListForm({ block, onChange }: Props<"list">) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const showIcons = block.style === "icon" || block.style === "cards";

  function setItem(id: string, patch: Partial<B<"list">["items"][number]>) {
    onChange({ ...block, items: block.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  }
  function addAfter(index: number) {
    const item = { id: uid(), text: "" };
    const items = [...block.items];
    items.splice(index + 1, 0, item);
    setFocusId(item.id);
    onChange({ ...block, items });
  }
  function remove(id: string) {
    const items = block.items.filter((i) => i.id !== id);
    onChange({ ...block, items: items.length ? items : [{ id: uid(), text: "" }] });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {LIST_STYLES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => onChange({ ...block, style: s.key })}
            className={`rounded-full border px-3 py-1 text-xs font-bold ${block.style === s.key ? "border-brand bg-brand text-white" : "border-ink/15 bg-white hover:bg-ink/5"}`}
          >
            {s.label}
          </button>
        ))}
        <select value={block.columns} onChange={(e) => onChange({ ...block, columns: Number(e.target.value) as 1 | 2 })} className="field !w-32 !py-1 text-xs">
          <option value={1}>1 column</option>
          <option value={2}>2 columns</option>
        </select>
        {showIcons && (
          <span className="flex items-center gap-2 text-xs font-semibold text-ink/60">
            Default icon <IconPicker value={block.icon} onChange={(icon) => onChange({ ...block, icon })} />
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {block.items.map((item, i) => (
          <li key={item.id} className="flex items-start gap-2">
            {showIcons && (
              <IconPicker value={item.icon ?? block.icon} onChange={(icon) => setItem(item.id, { icon })} label="Icon for this item" />
            )}
            <div className="flex-1 space-y-1.5">
              {block.style === "cards" && (
                <input value={item.title ?? ""} onChange={(e) => setItem(item.id, { title: e.target.value })} placeholder="Card title" className="field font-bold" />
              )}
              <input
                value={item.text}
                autoFocus={focusId === item.id}
                onChange={(e) => setItem(item.id, { text: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAfter(i);
                  }
                }}
                placeholder={block.style === "cards" ? "Card text" : `Item ${i + 1} (press Enter for the next)`}
                className="field"
              />
            </div>
            <button type="button" onClick={() => remove(item.id)} className="mt-1.5 rounded p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600" title="Remove item">
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => addAfter(block.items.length - 1)} className="btn btn-ghost !py-1.5">
        <Plus size={14} /> Add item
      </button>
    </div>
  );
}

function QuoteForm({ block, onChange }: Props<"quote">) {
  return (
    <div className="space-y-2">
      <textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={3} placeholder="The quote…" className="field resize-y font-display text-base italic" />
      <input value={block.cite} onChange={(e) => onChange({ ...block, cite: e.target.value })} placeholder="Who said it (optional)" className="field" />
    </div>
  );
}

function CalloutForm({ block, onChange }: Props<"callout">) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <IconPicker value={block.icon} onChange={(icon) => onChange({ ...block, icon })} allowNone />
        <input value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Title (optional)" className="field font-bold" />
        <select value={block.tone} onChange={(e) => onChange({ ...block, tone: e.target.value as B<"callout">["tone"] })} className="field !w-36">
          <option value="info">Blue — info</option>
          <option value="warning">Amber — warning</option>
          <option value="success">Green — good news</option>
          <option value="highlight">Brand — highlight</option>
        </select>
      </div>
      <RichText value={block.text} onChange={(text) => onChange({ ...block, text })} placeholder="Callout text…" minRows={2} />
    </div>
  );
}

function VideoForm({ block, onChange }: Props<"video">) {
  const embed = embedUrl(block.url);
  return (
    <div className="space-y-2">
      <input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="Paste a YouTube, Vimeo, Spotify or Apple Podcasts link" className="field" />
      <p className={`text-xs font-semibold ${embed ? "text-emerald-700" : block.url ? "text-amber-700" : "text-ink/45"}`}>
        {embed
          ? `✓ ${embed.kind === "video" ? "Video" : "Audio"} recognised — it will play inside the article`
          : block.url
            ? "Link not recognised — it will show as a plain link"
            : "Works with YouTube, Vimeo, Spotify and Apple Podcasts"}
      </p>
      <input value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption (optional)" className="field" />
    </div>
  );
}

function StatsForm({ block, onChange }: Props<"stats">) {
  function setItem(id: string, patch: Partial<B<"stats">["items"][number]>) {
    onChange({ ...block, items: block.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  }
  return (
    <div className="space-y-2">
      {block.items.map((s) => (
        <div key={s.id} className="flex gap-2">
          <input value={s.value} onChange={(e) => setItem(s.id, { value: e.target.value })} placeholder="e.g. 250+" className="field !w-32 font-bold" />
          <input value={s.label} onChange={(e) => setItem(s.id, { label: e.target.value })} placeholder="What it measures" className="field" />
          <button
            type="button"
            onClick={() => onChange({ ...block, items: block.items.filter((i) => i.id !== s.id) })}
            className="rounded p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
            title="Remove"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      {block.items.length < 6 && (
        <button type="button" onClick={() => onChange({ ...block, items: [...block.items, { id: uid(), value: "", label: "" }] })} className="btn btn-ghost !py-1.5">
          <Plus size={14} /> Add number
        </button>
      )}
    </div>
  );
}

function ButtonForm({ block, onChange }: Props<"button">) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_1.5fr_7rem]">
      <input value={block.label} onChange={(e) => onChange({ ...block, label: e.target.value })} placeholder="Button text" className="field font-bold" />
      <input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://…" className="field" />
      <select value={block.align} onChange={(e) => onChange({ ...block, align: e.target.value as "left" | "center" })} className="field">
        <option value="left">Left</option>
        <option value="center">Centre</option>
      </select>
    </div>
  );
}

function DividerForm({ block, onChange }: Props<"divider">) {
  return (
    <select value={block.style} onChange={(e) => onChange({ ...block, style: e.target.value as B<"divider">["style"] })} className="field !w-48">
      <option value="line">Line</option>
      <option value="dots">Dots</option>
      <option value="space">Blank space</option>
    </select>
  );
}

export function BlockForm({ block, onChange, userId }: { block: Block; onChange: (b: Block) => void; userId: string }) {
  switch (block.type) {
    case "heading":
      return <HeadingForm block={block} onChange={onChange} userId={userId} />;
    case "paragraph":
      return <ParagraphForm block={block} onChange={onChange} userId={userId} />;
    case "image":
      return <ImageForm block={block} onChange={onChange} userId={userId} />;
    case "list":
      return <ListForm block={block} onChange={onChange} userId={userId} />;
    case "quote":
      return <QuoteForm block={block} onChange={onChange} userId={userId} />;
    case "callout":
      return <CalloutForm block={block} onChange={onChange} userId={userId} />;
    case "video":
      return <VideoForm block={block} onChange={onChange} userId={userId} />;
    case "stats":
      return <StatsForm block={block} onChange={onChange} userId={userId} />;
    case "button":
      return <ButtonForm block={block} onChange={onChange} userId={userId} />;
    case "divider":
      return <DividerForm block={block} onChange={onChange} userId={userId} />;
  }
}
