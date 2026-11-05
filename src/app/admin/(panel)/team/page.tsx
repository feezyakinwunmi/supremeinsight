import { adminHref } from "@/lib/adminPath";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import { TeamTable } from "@/components/admin/TeamTable";
import type { Profile } from "@/lib/types";

export default async function TeamPage() {
  const { supabase, profile } = await requireStaff();
  if (profile?.role !== "admin") redirect(adminHref());

  const { data } = await supabase.from("profiles").select("*").order("created_at");

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Team</h1>
      <p className="mb-6 mt-1 text-sm text-ink/55">
        Approve people who have signed in, and choose what each person can do. Add new people in Supabase → Authentication → Users.
      </p>
      <TeamTable people={(data ?? []) as Profile[]} meId={profile.id} />
    </div>
  );
}
