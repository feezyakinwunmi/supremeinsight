"use client";
import { adminHref } from "@/lib/adminPath";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace(adminHref("/login"));
        router.refresh();
      }}
    >
      <LogOut size={16} /> Sign out
    </button>
  );
}
