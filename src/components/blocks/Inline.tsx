import type { ReactNode } from "react";

// Tiny, safe inline formatter: **bold**, *italic*, [link text](https://address).
// Anything else is plain text, so authors can never inject HTML.
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g;

function safeHref(href: string): string | null {
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href) || href.startsWith("/")) return href;
  return null;
}

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  const nodes: ReactNode[] = parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return link[1];
      const external = /^https?:/i.test(href);
      return (
        <a
          key={i}
          href={href}
          className="underline decoration-[color:var(--accent)] decoration-2 underline-offset-4 hover:bg-[color:var(--accent)]/10"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
  return <>{nodes}</>;
}
