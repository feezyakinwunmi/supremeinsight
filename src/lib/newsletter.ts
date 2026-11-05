import { siteUrl } from "@/lib/utils";

// Server-only. Emails are sent with Resend (https://resend.com). Set these in .env:
//   RESEND_API_KEY=re_...
//   NEWSLETTER_FROM="SupremeInsight <news@yourdomain.com>"   (a sender on a domain verified in Resend)
export function newsletterConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM);
}

type PostForEmail = {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  department: { name: string; color: string } | null;
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function emailHtml(post: PostForEmail, unsubscribeUrl: string) {
  const url = `${siteUrl()}/post/${post.slug}`;
  const color = post.department?.color ?? "#8a1c2c";
  return `<!doctype html><html><body style="margin:0;background:#f4f4f2;font-family:Arial,Helvetica,sans-serif;color:#111114">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden">
<tr><td style="padding:24px 28px;font-size:18px;font-weight:bold">Supreme<span style="color:#8a1c2c">Insight</span></td></tr>
${post.cover_image ? `<tr><td><img src="${esc(post.cover_image)}" width="560" alt="" style="display:block;width:100%;height:auto"></td></tr>` : ""}
<tr><td style="padding:28px">
${post.department ? `<p style="margin:0 0 10px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:${esc(color)}">New in ${esc(post.department.name)}</p>` : ""}
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.3">${esc(post.title)}</h1>
${post.excerpt ? `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#55555a">${esc(post.excerpt)}</p>` : ""}
<a href="${url}" style="display:inline-block;background:#8a1c2c;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:999px">Read the story</a>
</td></tr></table>
<p style="max-width:560px;margin:20px auto 0;font-size:12px;line-height:1.6;color:#8a8a90">You are getting this because you subscribed to SupremeInsight updates.<br>
<a href="${unsubscribeUrl}" style="color:#8a8a90">Unsubscribe</a></p>
</td></tr></table></body></html>`;
}

/** Sends one email per subscriber (Resend batch API, 100 per request). Returns how many were accepted. */
export async function sendNewPostEmails(post: PostForEmail, subscribers: { email: string; token: string }[]) {
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.NEWSLETTER_FROM!;
  const subject = post.department ? `New in ${post.department.name}: ${post.title}` : `New story: ${post.title}`;
  let sent = 0;

  for (let i = 0; i < subscribers.length; i += 100) {
    const chunk = subscribers.slice(i, i + 100).map((s) => {
      const unsubscribeUrl = `${siteUrl()}/newsletter/unsubscribe?token=${s.token}`;
      return {
        from,
        to: [s.email],
        subject,
        html: emailHtml(post, unsubscribeUrl),
        headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
      };
    });
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Email provider error (${res.status}) ${detail.slice(0, 200)}`);
    }
    sent += chunk.length;
  }
  return sent;
}
