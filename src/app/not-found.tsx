import Link from "next/link";
import { Logo } from "@/components/site/Header";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Link href="/" aria-label="SupremeInsight home">
        <Logo />
      </Link>
      <p className="mt-14 font-display text-8xl font-bold tracking-tight text-brand">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight md:text-3xl">This page could not be found</h1>
      <p className="mt-3 max-w-md text-ink/60">The link may be broken, or the page may have been moved.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to the homepage
      </Link>
    </div>
  );
}
