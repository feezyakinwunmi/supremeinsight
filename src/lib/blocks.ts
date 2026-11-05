import type { Block, BlockType } from "./types";
import { uid } from "./utils";

export const BLOCK_LABELS: Record<BlockType, { label: string; hint: string }> = {
  heading: { label: "Heading", hint: "Section title" },
  paragraph: { label: "Text", hint: "A paragraph" },
  image: { label: "Image", hint: "Photo with caption" },
  list: { label: "List", hint: "Bullets, numbers, icons or cards" },
  quote: { label: "Quote", hint: "Pull quote" },
  callout: { label: "Callout", hint: "Highlighted note" },
  video: { label: "Video / Audio", hint: "YouTube, Spotify, Apple, Vimeo" },
  stats: { label: "Key numbers", hint: "Big stats in a row" },
  button: { label: "Button", hint: "Link / call to action" },
  divider: { label: "Divider", hint: "Line, dots or space" },
};

export const BLOCK_TYPES = Object.keys(BLOCK_LABELS) as BlockType[];

export function newBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case "heading":
      return { id, type, text: "", level: 2 };
    case "paragraph":
      return { id, type, text: "" };
    case "image":
      return { id, type, url: "", alt: "", caption: "", width: "wide" };
    case "list":
      return { id, type, style: "bullet", icon: "CheckCircle2", columns: 1, items: [{ id: uid(), text: "" }] };
    case "quote":
      return { id, type, text: "", cite: "" };
    case "callout":
      return { id, type, tone: "info", icon: "Lightbulb", title: "", text: "" };
    case "video":
      return { id, type, url: "", caption: "" };
    case "stats":
      return { id, type, items: [{ id: uid(), value: "", label: "" }, { id: uid(), value: "", label: "" }, { id: uid(), value: "", label: "" }] };
    case "button":
      return { id, type, label: "Read more", url: "", align: "left" };
    case "divider":
      return { id, type, style: "line" };
  }
}

export function duplicateBlock(block: Block): Block {
  const copy = JSON.parse(JSON.stringify(block)) as Block;
  copy.id = uid();
  if (copy.type === "list") copy.items = copy.items.map((i) => ({ ...i, id: uid() }));
  if (copy.type === "stats") copy.items = copy.items.map((i) => ({ ...i, id: uid() }));
  return copy;
}

// Plain text of a post, used for reading-time and search snippets
export function blocksToText(blocks: Block[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    switch (b.type) {
      case "heading":
      case "paragraph":
        out.push(b.text);
        break;
      case "quote":
        out.push(b.text);
        break;
      case "callout":
        out.push(b.title, b.text);
        break;
      case "list":
        b.items.forEach((i) => out.push(i.title ?? "", i.text));
        break;
      case "stats":
        b.items.forEach((i) => out.push(i.value, i.label));
        break;
    }
  }
  return out.join(" ");
}

export function readingMinutes(blocks: Block[]) {
  const words = blocksToText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Turn a pasted video / audio link into an embeddable address
export function embedUrl(raw: string): { src: string; kind: "video" | "audio" } | null {
  const url = raw.trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return { src: `https://www.youtube.com/embed/${u.pathname.slice(1)}`, kind: "video" };
    }
    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch" && u.searchParams.get("v")) {
        return { src: `https://www.youtube.com/embed/${u.searchParams.get("v")}`, kind: "video" };
      }
      if (u.pathname.startsWith("/embed/")) return { src: url, kind: "video" };
      if (u.pathname.startsWith("/shorts/")) {
        return { src: `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`, kind: "video" };
      }
      if (u.pathname === "/playlist" && u.searchParams.get("list")) {
        return { src: `https://www.youtube.com/embed/videoseries?list=${u.searchParams.get("list")}`, kind: "video" };
      }
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return { src: `https://player.vimeo.com/video/${id}`, kind: "video" };
    }
    if (host === "open.spotify.com") {
      return { src: `https://open.spotify.com/embed${u.pathname}`, kind: "audio" };
    }
    if (host === "podcasts.apple.com") {
      return { src: url.replace("podcasts.apple.com", "embed.podcasts.apple.com"), kind: "audio" };
    }
  } catch {
    return null;
  }
  return null;
}
