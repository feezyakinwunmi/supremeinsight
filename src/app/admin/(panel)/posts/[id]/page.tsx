import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { PostEditor } from "@/components/admin/PostEditor";
import type { Department, Post } from "@/lib/types";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireStaff();

  const [{ data: post }, { data: departments }] = await Promise.all([
    supabase.from("posts").select("*").eq("id", id).maybeSingle(),
    supabase.from("departments").select("*").order("sort_order"),
  ]);

  if (!post) notFound();

  return (
    <PostEditor
      // remount the editor if a different post is opened
      key={id}
      initial={post as Post}
      departments={(departments ?? []) as Department[]}
      profile={{ id: profile!.id, full_name: profile!.full_name, role: profile!.role }}
    />
  );
}
