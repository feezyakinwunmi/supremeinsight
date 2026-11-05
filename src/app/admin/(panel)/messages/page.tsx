import { requireStaff } from "@/lib/admin";
import { MessagesList, type ContactMessage } from "@/components/admin/MessagesList";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, topic, message, handled, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <h1 className="font-display text-3xl font-bold">Messages</h1>
      <p className="mb-6 mt-1 text-sm text-ink/55">Sent through the Contact page. Reply by email, then mark them as handled.</p>
      {error ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          The messages table isn&apos;t set up yet. Run <code>supabase/newsletter-and-contact.sql</code> in the Supabase SQL editor.
        </p>
      ) : (
        <MessagesList initial={(data ?? []) as ContactMessage[]} />
      )}
    </div>
  );
}
