import { adminHref } from "@/lib/adminPath";
import Link from "next/link";
import type { Metadata } from "next";
import { requireStaff, isStaffRole } from "@/lib/admin";
import { Logo } from "@/components/site/Header";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { BarChart3, FilePlus2, FileText, Inbox, LayoutDashboard, Mail, Users, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Staff", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireStaff();

  // Signed up but not approved yet
  if (!profile || !isStaffRole(profile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-5">
        <div className="max-w-md rounded-2xl border border-ink/10 bg-white p-8 text-center shadow-sm">
          <Clock className="mx-auto mb-3 text-brand" />
          <h1 className="font-display text-2xl font-bold">Waiting for approval</h1>
          <p className="mt-2 text-sm text-ink/60">
            You&apos;re signed in as {user.email}. An administrator needs to approve your account before you can write for SupremeInsight.
          </p>
          <SignOutButton className="btn btn-ghost mt-6" />
        </div>
      </div>
    );
  }

  const nav = [
    { href: adminHref(), label: "Dashboard", icon: LayoutDashboard },
    { href: adminHref("/posts"), label: "Posts", icon: FileText },
    { href: adminHref("/posts/new"), label: "New post", icon: FilePlus2 },
    { href: adminHref("/analytics"), label: "Analytics", icon: BarChart3 },
    { href: adminHref("/subscribers"), label: "Subscribers", icon: Mail },
    { href: adminHref("/messages"), label: "Messages", icon: Inbox },
    ...(profile.role === "admin" ? [{ href: adminHref("/team"), label: "Team", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-paper md:flex">
      <aside className="border-b border-ink/10 bg-white md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-4 py-4 md:block">
          <Link href={adminHref()}>
            <Logo />
          </Link>
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand md:mt-2 md:inline-block">
            {profile.role}
          </span>
          <SignOutButton className="flex items-center gap-1.5 text-xs font-semibold text-ink/60 md:hidden" />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:pb-0">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-ink/5 hover:text-ink"
            >
              <n.icon size={17} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-3 pt-6 md:absolute md:bottom-4 md:block md:w-full md:pr-6">
          <p className="mb-2 truncate px-3 text-xs text-ink/50">{profile.full_name || user.email}</p>
          <Link href="/" target="_blank" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink/60 hover:bg-ink/5">
            View site ↗
          </Link>
          <SignOutButton className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-ink/60 hover:bg-ink/5" />
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
