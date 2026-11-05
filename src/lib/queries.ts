import { createPublicClient } from "./supabase/server";
import type { Department, Post, PostCardData, Author } from "./types";

const CARD_FIELDS =
  "id, slug, title, excerpt, cover_image, reading_minutes, published_at, featured, tags, author_id, department:departments(slug, name, color)";

type CardRow = Omit<PostCardData, "author" | "department"> & {
  author_id: string | null;
  department: PostCardData["department"] | PostCardData["department"][] | null;
};

async function attachAuthors(rows: CardRow[]): Promise<PostCardData[]> {
  const supabase = createPublicClient();
  const ids = Array.from(new Set(rows.map((r) => r.author_id).filter(Boolean))) as string[];
  const authors = new Map<string, string | null>();
  if (ids.length) {
    const { data } = await supabase.from("authors_public").select("id, full_name").in("id", ids);
    (data ?? []).forEach((a) => authors.set(a.id as string, a.full_name as string | null));
  }
  return rows.map((r) => {
    const dept = Array.isArray(r.department) ? r.department[0] ?? null : r.department;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      cover_image: r.cover_image,
      reading_minutes: r.reading_minutes,
      published_at: r.published_at,
      featured: r.featured,
      tags: r.tags,
      department: dept,
      author: r.author_id ? { full_name: authors.get(r.author_id) ?? null } : null,
    };
  });
}

export async function getDepartments(): Promise<Department[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("departments").select("*").order("sort_order");
  return (data ?? []) as Department[];
}

export async function getLatestPosts(limit = 12, departmentId?: string, offset = 0): Promise<PostCardData[]> {
  const supabase = createPublicClient();
  let q = supabase
    .from("posts")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (departmentId) q = q.eq("department_id", departmentId);
  const { data } = await q;
  return attachAuthors((data ?? []) as unknown as CardRow[]);
}

export async function getFeaturedPost(): Promise<PostCardData | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1);
  if (data && data.length) return (await attachAuthors(data as unknown as CardRow[]))[0];
  const latest = await getLatestPosts(1);
  return latest[0] ?? null;
}

export async function searchPosts(term: string): Promise<PostCardData[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .textSearch("fts", term, { type: "websearch", config: "english" })
    .limit(30);
  return attachAuthors((data ?? []) as unknown as CardRow[]);
}

export async function getPostBySlug(slug: string): Promise<{ post: Post; department: Department | null; author: Author | null } | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!data) return null;
  const post = data as Post;

  let department: Department | null = null;
  if (post.department_id) {
    const { data: d } = await supabase.from("departments").select("*").eq("id", post.department_id).maybeSingle();
    department = (d as Department) ?? null;
  }
  let author: Author | null = null;
  if (post.author_id) {
    const { data: a } = await supabase.from("authors_public").select("*").eq("id", post.author_id).maybeSingle();
    author = (a as Author) ?? null;
  }
  return { post, department, author };
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<PostCardData[]> {
  const supabase = createPublicClient();
  let q = supabase
    .from("posts")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (post.department_id) q = q.eq("department_id", post.department_id);
  const { data } = await q;
  return attachAuthors((data ?? []) as unknown as CardRow[]);
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; published_at: string | null }[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("posts").select("slug, published_at").eq("status", "published");
  return (data ?? []) as { slug: string; published_at: string | null }[];
}

export type SortKey = "latest" | "oldest" | "az" | "za";

// Homepage list: optional text search, department filter and sort order.
export async function browsePosts({
  q,
  departmentId,
  sort = "latest",
  limit = 10,
  offset = 0,
}: {
  q?: string;
  departmentId?: string;
  sort?: SortKey;
  limit?: number;
  offset?: number;
}): Promise<PostCardData[]> {
  const supabase = createPublicClient();
  let query = supabase.from("posts").select(CARD_FIELDS).eq("status", "published");
  if (departmentId) query = query.eq("department_id", departmentId);
  if (q) query = query.textSearch("fts", q, { type: "websearch", config: "english" });
  if (sort === "az" || sort === "za") query = query.order("title", { ascending: sort === "az" });
  else query = query.order("published_at", { ascending: sort === "oldest" });
  const { data } = await query.range(offset, offset + limit - 1);
  return attachAuthors((data ?? []) as unknown as CardRow[]);
}

// Posts marked "featured" by editors (newest first).
export async function getFeaturedPosts(limit = 4): Promise<PostCardData[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("posts")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return attachAuthors((data ?? []) as unknown as CardRow[]);
}
