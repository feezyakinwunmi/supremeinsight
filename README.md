# SupremeInsight

Internal publication platform for the Christian marketplace: a public blog site plus a staff-only admin with a free-form block editor, three templates, and reader analytics.

- **Public site:** home, 10 departments, article pages, search, about, sitemap/robots
- **Admin (secret URL, see below):** staff login, posts list, block editor with live preview, publish workflow, analytics dashboard, team/roles
- **Stack:** Next.js 15 (App Router) · Tailwind 3 · Supabase (Postgres, Auth, Storage) · dnd-kit · lucide-react

Posting is **internal only**: there is no public sign-up or upload. Only approved staff can write.

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, and **Run**.
3. Copy **Project URL** and **anon public key** from *Project Settings → API*.

## 2. Run locally

```bash
cp .env.example .env.local     # then fill in the two Supabase values
npm install
npm run dev
```

Open http://localhost:3000. The staff area lives at a secret address set by `NEXT_PUBLIC_ADMIN_PATH` in `.env` (e.g. `NEXT_PUBLIC_ADMIN_PATH=desk-abc123` → http://localhost:3000/desk-abc123/login). The plain `/admin` URL returns 404, nothing on the public site links to the staff area, and robots.txt does not mention it. To move the panel, change the value and restart (or redeploy). Bookmark the address and share it only with staff.

## 3. Create your admin account

1. On the login page click **“First time setting up? Create the admin account”** and sign up.
   The **first account created automatically becomes admin.**
2. If Supabase asks for email confirmation, confirm it (or turn off *Authentication → Providers → Email → Confirm email* while testing).
3. Then switch off **Authentication → Providers → Email → “Allow new users to sign up”** so the site stays internal.
4. Add teammates in **Supabase → Authentication → Users → Add user**, then set their role in the app under **Admin → Team**.

## Roles

| Role | Can do |
|---|---|
| pending | Nothing (waiting for approval) |
| writer | Write drafts, edit their own drafts, submit for review |
| editor | Everything a writer can, plus edit anyone's post, publish/unpublish, delete, feature on homepage |
| admin | Everything, plus manage team roles |

## How posts work

A post is an ordered list of **blocks** (heading, text, image, list, quote, callout, video/audio, key numbers, button, divider). Authors can add, drag, duplicate and delete blocks in any order. The **template** (Editorial, Magazine, Minimal) only controls the look and can be switched at any time without touching the content.

Lists can be bullets, numbers, checkmarks, dashes, icons or cards, and every item can have its own icon (searchable icon library, or type any emoji).

## Analytics

Each published article records: views, scroll depth (25/50/75/100%), **active** reading time (only while the tab is visible and the reader is interacting), link/button clicks, referrer and device. Staff see this under **Admin → Analytics** (7/30/90 days). Data is written through the `track_event` function and read through staff-only functions, so visitors can never read it.

Views from staff previewing a live post are counted too; use the editor's live preview to avoid that.

## Newsletter & contact form

1. In Supabase > SQL Editor, run `supabase/newsletter-and-contact.sql` once (fresh projects get it from `schema.sql`).
2. Readers subscribe on the homepage, article pages, department pages or `/newsletter`, and choose the departments they want (none = every story).
3. To actually send emails, create a free account at resend.com, verify your domain, and add to `.env` (and your host):
   ```
   RESEND_API_KEY=re_xxx
   NEWSLETTER_FROM="SupremeInsight <news@yourdomain.com>"
   ```
4. When an editor publishes a post for the first time, everyone subscribed to that department (or to all topics) gets one email with a link to the story and a one-click unsubscribe link. A post is never emailed twice.
5. Staff see subscribers (with CSV export) under **Admin > Subscribers**, and Contact page messages under **Admin > Messages**.

## Deploy

Deploy to Vercel (or any Next.js host) and set the same four environment variables (including `NEXT_PUBLIC_ADMIN_PATH`). Set `NEXT_PUBLIC_SITE_URL` to the live address.

## Not included yet (planned)

Public creator uploads, comments, department management screen (the 10 departments are seeded in the database), image library, scheduled publishing.
