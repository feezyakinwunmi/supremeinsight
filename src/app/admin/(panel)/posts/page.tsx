import { adminHref } from "@/lib/adminPath";
import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { PostsTable, type PostRow } from "@/components/admin/PostsTable";
import type { PostStatus } from "@/lib/types";
import { FilePlus2 } from "lucide-react";

export default async function PostsPage() {
  const { supabase, profile } = await requireStaff();

  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, status, updated_at, author_id, department:departments(name)")
    .order("updated_at", { ascending: false });

  const authorIds = Array.from(new Set((data ?? []).map((p) => p.author_id).filter(Boolean))) as string[];
  const names = new Map<string, string | null>();
  if (authorIds.length) {
    const { data: people } = await supabase.from("profiles").select("id, full_name").in("id", authorIds);
    (people ?? []).forEach((p) => names.set(p.id as string, p.full_name as string | null));
  }

  const rows: PostRow[] = (data ?? []).map((p) => {
    const dept = Array.isArray(p.department) ? p.department[0] : p.department;
    return {
      id: p.id as string,
      title: p.title as string,
      slug: p.slug as string,
      status: p.status as PostStatus,
      updated_at: p.updated_at as string,
      author_id: p.author_id as string | null,
      department: (dept as { name: string } | null)?.name ?? null,
      author: p.author_id ? names.get(p.author_id as string) ?? null : null,
    };
  });

  const isEditor = profile?.role === "editor" || profile?.role === "admin";

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Posts</h1>
        <Link href={adminHref("/posts/new")} className="btn btn-primary">
          <FilePlus2 size={16} /> New post
        </Link>
      </div>
      <PostsTable rows={rows} userId={profile!.id} isEditor={isEditor} />
    </div>
  );
}
