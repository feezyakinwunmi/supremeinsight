import { requireStaff } from "@/lib/admin";
import { PostEditor } from "@/components/admin/PostEditor";
import type { Department } from "@/lib/types";

export default async function NewPostPage() {
  const { supabase, profile } = await requireStaff();
  const { data } = await supabase.from("departments").select("*").order("sort_order");

  return (
    <PostEditor
      initial={null}
      departments={(data ?? []) as Department[]}
      profile={{ id: profile!.id, full_name: profile!.full_name, role: profile!.role }}
    />
  );
}
