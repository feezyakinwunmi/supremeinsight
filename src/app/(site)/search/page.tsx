import type { Metadata } from "next";
import { searchPosts } from "@/lib/queries";
import { PostCard } from "@/components/site/PostCard";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const term = (q ?? "").trim().slice(0, 100);
  const results = term ? await searchPosts(term) : [];

  return (
    <div className="container-x py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Search stories</h1>
        <p className="mt-3 text-ink/55">Find articles, interviews and insights across every topic.</p>
        <form action="/search" className="relative mt-8">
          <Search size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            name="q"
            defaultValue={term}
            autoFocus
            placeholder="Try “leadership” or “finance”"
            className="w-full rounded-2xl border border-ink/10 bg-white py-4 pl-14 pr-32 text-base shadow-card outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
          <button type="submit" className="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2 rounded-xl">
            Search
          </button>
        </form>
      </div>

      {term && (
        <p className="mt-14 text-sm font-medium text-ink/55">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{term}&rdquo;
        </p>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
