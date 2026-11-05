import Link from "next/link";
import { browsePosts, getDepartments, getFeaturedPost, getFeaturedPosts, getLatestPosts, type SortKey } from "@/lib/queries";
import { HeroSlider, type HeroSlide } from "@/components/site/HeroSlider";
import { TopicMarquee } from "@/components/site/TopicMarquee";
import { ContinueReading } from "@/components/site/ContinueReading";
import { PostCard } from "@/components/site/PostCard";
import { NewsletterSignup } from "@/components/site/NewsletterSignup";
import { ArrowDownAZ, ArrowDownWideNarrow, Check, LayoutGrid, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { DeptIcon } from "@/lib/departmentIcons";
import type { Department } from "@/lib/types";

export const revalidate = 60;

const PAGE_SIZE = 10;

const SORTS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "Latest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "az", label: "Title A to Z" },
  { key: "za", label: "Title Z to A" },
];

type Filters = { q: string; topic: string; sort: SortKey; page: number };

// Build a homepage link that keeps the current filters, with some changed.
function linkWith(f: Filters, change: Partial<Filters>) {
  const next = { ...f, page: 1, ...change };
  const p = new URLSearchParams();
  if (next.q) p.set("q", next.q);
  if (next.topic) p.set("topic", next.topic);
  if (next.sort !== "latest") p.set("sort", next.sort);
  if (next.page > 1) p.set("page", String(next.page));
  const qs = p.toString();
  return `/${qs ? `?${qs}` : ""}#stories`;
}

function Card({ title, icon, children, className = "" }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/[0.04] ${className}`}>
      <h3 className="mb-4 flex items-center gap-2 font-display text-[0.95rem] font-semibold">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function SearchBox({ f, big = false }: { f: Filters; big?: boolean }) {
  return (
    <form action="/#stories" className="relative">
      {f.topic && <input type="hidden" name="topic" value={f.topic} />}
      {f.sort !== "latest" && <input type="hidden" name="sort" value={f.sort} />}
      <Search size={big ? 20 : 17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
      <input
        name="q"
        type="search"
        defaultValue={f.q}
        placeholder="Search articles…"
        aria-label="Search articles"
        className={`w-full rounded-2xl border border-ink/10 bg-white text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10 ${
          big ? "py-4 pl-12 pr-32 text-base shadow-lift" : "bg-paper py-3 pl-11 pr-3 text-sm"
        }`}
      />
      {big && (
        <button type="submit" className="btn btn-primary absolute right-2 top-1/2 -translate-y-1/2 rounded-xl">
          Search
        </button>
      )}
    </form>
  );
}

function TopicFilter({ f, departments }: { f: Filters; departments: Department[] }) {
  const item = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
      active ? "bg-ink text-white" : "text-ink/70 hover:bg-ink/[0.04] hover:text-ink"
    }`;
  return (
    <ul className="space-y-0.5">
      <li>
        <Link href={linkWith(f, { topic: "" })} className={item(!f.topic)}>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${!f.topic ? "bg-white/15" : "bg-brand-soft text-brand"}`}>
            <LayoutGrid size={14} />
          </span>
          <span className="flex-1 font-medium">All topics</span>
          {!f.topic && <Check size={15} />}
        </Link>
      </li>
      {departments.map((d) => {
        const on = f.topic === d.slug;
        return (
          <li key={d.id}>
            <Link href={linkWith(f, { topic: on ? "" : d.slug })} className={item(on)}>
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={on ? { background: "rgba(255,255,255,0.15)" } : { background: `${d.color}17`, color: d.color }}
              >
                <DeptIcon slug={d.slug} size={14} />
              </span>
              <span className="flex-1 font-medium">{d.name}</span>
              {on && <Check size={15} />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SortOptions({ f }: { f: Filters }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SORTS.map((s) => (
        <Link
          key={s.key}
          href={linkWith(f, { sort: s.key })}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-center text-xs font-semibold transition ${
            f.sort === s.key ? "border-ink bg-ink text-white" : "border-ink/10 text-ink/70 hover:border-ink/30 hover:text-ink"
          }`}
        >
          {s.key === "az" || s.key === "za" ? <ArrowDownAZ size={13} /> : <ArrowDownWideNarrow size={13} />}
          {s.label}
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const f: Filters = {
    q: (sp.q ?? "").trim().slice(0, 100),
    topic: sp.topic ?? "",
    sort: (SORTS.some((s) => s.key === sp.sort) ? sp.sort : "latest") as SortKey,
    page: Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1),
  };

  const departments = await getDepartments();
  const activeDept = departments.find((d) => d.slug === f.topic) ?? null;
  if (!activeDept) f.topic = "";

  const [rows, featured, featuredList] = await Promise.all([
    browsePosts({ q: f.q || undefined, departmentId: activeDept?.id, sort: f.sort, limit: f.page * PAGE_SIZE + 1 }),
    getFeaturedPost(),
    getFeaturedPosts(4),
  ]);
  const posts = rows.slice(0, f.page * PAGE_SIZE);
  const hasMore = rows.length > posts.length;
  const sidebarPicks = (featuredList.length ? featuredList : posts.slice(0, 4)).slice(0, 4);
  const filtered = Boolean(f.q || activeDept || f.sort !== "latest");

  const heading = f.q ? `Results for “${f.q}”` : activeDept ? activeDept.name : "Latest stories";

  // Hero: welcome slide, then the featured + newest stories, topped up with brand slides.
  const fallbackImages = ["/images/workplace.jpg", "/images/bible.jpg", "/images/church.jpg"];
  const storySlides: HeroSlide[] = [featured, ...(await getLatestPosts(3))]
    .filter((p, i, arr): p is NonNullable<typeof p> => Boolean(p) && arr.findIndex((x) => x?.id === p?.id) === i)
    .slice(0, 2)
    .map((p, i) => ({
      image: p.cover_image || fallbackImages[i],
      eyebrow: i === 0 && p.featured ? `Featured · ${p.department?.name ?? "Story"}` : p.department?.name ?? "Latest story",
      eyebrowColor: p.department?.color,
      title: p.title,
      text: p.excerpt,
      href: `/post/${p.slug}`,
      cta: "Read the story",
      meta: [p.author?.full_name ? `By ${p.author.full_name}` : null, `${p.reading_minutes} min read`].filter(Boolean).join(" · "),
    }));
  const brandSlides: HeroSlide[] = [
    {
      image: "/images/workplace.jpg",
      eyebrow: "Business & Leadership",
      title: "Where faith meets the boardroom",
      text: "Interviews and insight from believers building companies, leading teams and shaping industries.",
      href: "/#stories",
      cta: "Explore stories",
      secondaryHref: "/about",
      secondaryLabel: "Who we are",
    },
    {
      image: "/images/church.jpg",
      eyebrow: "Newsletter",
      title: "Stories that matter, straight to your inbox",
      text: "Choose the topics you care about and get an email the moment a new story is published.",
      href: "/newsletter",
      cta: "Subscribe free",
      secondaryHref: "/#stories",
      secondaryLabel: "Read first",
    },
  ];
  const slides: HeroSlide[] = [
    {
      image: "/images/hero.jpg",
      eyebrow: "Faith · Business · Culture",
      title: "Insight for the Christian marketplace",
      text: "News, interviews and thought leadership on faith, business, finance, media, technology and leadership, from the pulpit to the boardroom.",
      href: "/#stories",
      cta: "Start reading",
      secondaryHref: "/newsletter",
      secondaryLabel: "Get the newsletter",
    },
    ...storySlides,
    ...brandSlides,
  ].slice(0, 3);

  return (
    <>
      <HeroSlider slides={slides} />
      <TopicMarquee departments={departments} />
      <ContinueReading />

      {/* STORIES + SIDEBAR */}
      <section id="stories" className="container-x scroll-mt-20 py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] xl:grid-cols-[1fr_22rem]">
          <div className="min-w-0">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{heading}</h2>
                <p className="mt-1 text-sm text-ink/55">
                  {posts.length === 0 ? "No stories found" : `Showing ${posts.length} ${posts.length === 1 ? "story" : "stories"}`}
                  {f.sort !== "latest" && ` · ${SORTS.find((s) => s.key === f.sort)?.label}`}
                </p>
              </div>
              {filtered && (
                <Link href="/#stories" className="pill border border-ink/10 bg-white py-1.5 text-ink/70 hover:border-ink/30">
                  <X size={13} /> Clear filters
                </Link>
              )}
            </div>

            {/* Mobile filters */}
            <div className="mb-6 space-y-3 lg:hidden">
              <SearchBox f={f} />
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                <Link
                  href={linkWith(f, { topic: "" })}
                  className={`pill shrink-0 border py-1.5 ${!f.topic ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink/70"}`}
                >
                  All
                </Link>
                {departments.map((d) => (
                  <Link
                    key={d.id}
                    href={linkWith(f, { topic: f.topic === d.slug ? "" : d.slug })}
                    className={`pill shrink-0 border py-1.5 ${f.topic === d.slug ? "border-transparent text-white" : "border-ink/10 bg-white text-ink/70"}`}
                    style={f.topic === d.slug ? { background: d.color } : undefined}
                  >
                    {d.name}
                  </Link>
                ))}
              </div>
              <SortOptions f={f} />
            </div>

            {posts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
                <p className="font-display text-lg font-semibold">Nothing here yet</p>
                <p className="mt-1 text-ink/55">Try another search or topic, or clear your filters.</p>
                <Link href="/#stories" className="btn btn-ghost mt-6">
                  Show all stories
                </Link>
              </div>
            ) : (
              <>
                {!filtered && f.page === 1 && posts[0] && (
                  <div className="mb-6">
                    <PostCard post={posts[0]} variant="wide" />
                  </div>
                )}
                <div className="grid gap-6 sm:grid-cols-2">
                  {(!filtered && f.page === 1 ? posts.slice(1) : posts).map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              </>
            )}

            {hasMore && (
              <div className="mt-10 text-center">
                <Link href={linkWith(f, { page: f.page + 1 })} scroll={false} className="btn btn-ghost px-8">
                  Load more stories
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pb-4 lg:[scrollbar-width:thin]">
            <Card title="Search" icon={<Search size={16} className="text-brand" />} className="hidden lg:block">
              <SearchBox f={f} />
            </Card>

            <Card title="Topics" icon={<SlidersHorizontal size={16} className="text-brand" />} className="hidden lg:block">
              <TopicFilter f={f} departments={departments} />
            </Card>

            <Card title="Sort by" icon={<ArrowDownWideNarrow size={16} className="text-brand" />} className="hidden lg:block">
              <SortOptions f={f} />
            </Card>

            {sidebarPicks.length > 0 && (
              <Card title={featuredList.length ? "Featured articles" : "Popular right now"} icon={<Sparkles size={16} className="text-brand" />}>
                <div className="-mx-2 space-y-1">
                  {sidebarPicks.map((p) => (
                    <PostCard key={p.id} post={p} variant="mini" />
                  ))}
                </div>
              </Card>
            )}

            <div className="relative overflow-hidden rounded-3xl bg-ink p-5">
              <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/60 blur-3xl" />
              <div className="relative">
                <h3 className="font-display text-lg font-semibold text-white">Get new stories by email</h3>
                <p className="mb-4 mt-1 text-sm text-white/60">
                  {activeDept ? `Updates from ${activeDept.name}, straight to your inbox.` : "Get every new story, or pick topics on our newsletter page."}
                </p>
                <NewsletterSignup
                  departments={departments.map((d) => ({ id: d.id, name: d.name, color: d.color }))}
                  defaultDepartmentId={activeDept?.id}
                  showTopics={false}
                  tone="dark"
                />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
