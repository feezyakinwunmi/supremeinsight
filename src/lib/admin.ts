import { redirect } from "next/navigation";
import { adminHref } from "@/lib/adminPath";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Returns the logged-in staff member, or sends them to the login page.
export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(adminHref("/login"));

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { supabase, user, profile: (profile as Profile | null) ?? null };
}

export function isStaffRole(role: string | undefined | null) {
  return role === "writer" || role === "editor" || role === "admin";
}
