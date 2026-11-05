import type { TemplateKey } from "./types";

// A template only controls how a post LOOKS. The order of blocks is always the author's choice.
export type TemplateStyle = {
  name: string;
  description: string;
  // wrapper around all blocks
  wrap: string;
  // paragraph text
  p: string;
  h2: string;
  h3: string;
  quote: string;
  quoteMark: string;
  callout: string;
  card: string;
  stat: string;
  statValue: string;
  caption: string;
  // article header layout
  header: "centered" | "cover" | "left";
};

export const TEMPLATES: Record<TemplateKey, TemplateStyle> = {
  editorial: {
    name: "Editorial",
    description: "Classic long-form reading experience, centred header. Best for long features and opinion.",
    wrap: "max-w-[44rem] mx-auto space-y-7",
    p: "font-sans text-[1.125rem] leading-[1.85] text-ink/85",
    h2: "font-display text-3xl md:text-[2.1rem] font-semibold tracking-tight leading-tight text-ink pt-4",
    h3: "font-display text-2xl font-bold leading-snug text-ink pt-2",
    quote: "font-display text-2xl md:text-[1.7rem] font-medium leading-snug text-ink border-l-4 border-[color:var(--accent)] pl-6 py-1",
    quoteMark: "text-[color:var(--accent)]",
    callout: "rounded-xl p-6",
    card: "rounded-xl border border-ink/10 bg-white p-5",
    stat: "text-center",
    statValue: "font-display text-4xl md:text-5xl font-bold text-[color:var(--accent)]",
    caption: "text-sm text-ink/55 mt-2 text-center",
    header: "centered",
  },
  magazine: {
    name: "Magazine",
    description: "Bold full-width cover with the title over the image. Best for news and features with strong photos.",
    wrap: "max-w-3xl mx-auto space-y-8",
    p: "font-sans text-[1.08rem] leading-[1.8] text-ink/85",
    h2: "font-sans text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-ink pt-4 border-t-4 border-[color:var(--accent)] mt-4 w-full",
    h3: "font-sans text-xl md:text-2xl font-bold text-[color:var(--accent)] pt-2",
    quote: "font-sans text-2xl md:text-3xl font-extrabold leading-tight text-[color:var(--accent)] py-2",
    quoteMark: "text-ink/20",
    callout: "rounded-none border-l-8 p-6",
    card: "rounded-none border-t-4 border-[color:var(--accent)] bg-white p-5 shadow-sm",
    stat: "text-left border-l-4 border-[color:var(--accent)] pl-4",
    statValue: "font-sans text-4xl md:text-5xl font-extrabold text-ink",
    caption: "text-xs uppercase tracking-wider text-ink/50 mt-2",
    header: "cover",
  },
  minimal: {
    name: "Minimal",
    description: "Clean, quiet and fast. Left-aligned header and lots of white space. Best for notes, briefs and updates.",
    wrap: "max-w-[40rem] mx-auto space-y-6",
    p: "font-sans text-base leading-[1.75] text-ink/80",
    h2: "font-sans text-2xl font-semibold text-ink pt-3",
    h3: "font-sans text-lg font-semibold text-ink pt-1",
    quote: "font-sans text-lg text-ink/70 border-l-2 border-ink/20 pl-4",
    quoteMark: "text-ink/30",
    callout: "rounded-lg p-4 text-sm",
    card: "rounded-lg border border-ink/10 p-4",
    stat: "text-left",
    statValue: "font-sans text-3xl font-semibold text-ink",
    caption: "text-xs text-ink/50 mt-2",
    header: "left",
  },
};

export const TEMPLATE_KEYS = Object.keys(TEMPLATES) as TemplateKey[];
