import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { newsletterConfigured, sendNewPostEmails } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

// Called by the editor right after a post is published.
// Emails every active subscriber who chose that post's department (or chose "all topics").
// Each post is only ever emailed once.
export async function POST(request: Request) {
  const { postId } = (await request.json().catch(() => ({}))) as { postId?: string };
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["editor", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Only editors can send newsletters" }, { status: 403 });
  }

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, cover_image, status, department_id, newsletter_sent_at")
    .eq("id", postId)
    .maybeSingle();
  if (!post || post.status !== "published") return NextResponse.json({ error: "Post is not published" }, { status: 400 });
  if (post.newsletter_sent_at) return NextResponse.json({ sent: 0, skipped: "already-sent" });
  if (!newsletterConfigured()) return NextResponse.json({ sent: 0, skipped: "not-configured" });

  // Subscribers who picked this department, plus everyone who picked "all topics" (empty list)
  let query = supabase.from("newsletter_subscribers").select("email, token").eq("status", "active");
  query = post.department_id
    ? query.or(`department_ids.eq.{},department_ids.cs.{${post.department_id}}`)
    : query.eq("department_ids", "{}");
  const { data: subscribers, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark as sent first so a double click can't email people twice
  const { data: claimed } = await supabase
    .from("posts")
    .update({ newsletter_sent_at: new Date().toISOString() })
    .eq("id", post.id)
    .is("newsletter_sent_at", null)
    .select("id");
  if (!claimed?.length) return NextResponse.json({ sent: 0, skipped: "already-sent" });
  if (!subscribers?.length) return NextResponse.json({ sent: 0 });

  let department: { name: string; color: string } | null = null;
  if (post.department_id) {
    const { data: d } = await supabase.from("departments").select("name, color").eq("id", post.department_id).maybeSingle();
    department = d ?? null;
  }

  try {
    const sent = await sendNewPostEmails({ ...post, department }, subscribers as { email: string; token: string }[]);
    return NextResponse.json({ sent });
  } catch (e) {
    // Undo the mark so the editor can retry
    await supabase.from("posts").update({ newsletter_sent_at: null }).eq("id", post.id);
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
