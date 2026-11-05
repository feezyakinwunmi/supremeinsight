import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_BASE } from "@/lib/adminPath";

const INTERNAL = "/admin"; // where the admin pages actually live in src/app

function isUnder(path: string, base: string) {
  return path === base || path.startsWith(`${base}/`);
}

// Serves the staff area from its secret address, hides the real /admin folder,
// and keeps the login session fresh.
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hidden = ADMIN_BASE !== INTERNAL;

  // Anyone poking at /admin gets an ordinary "page not found".
  if (hidden && isUnder(path, INTERNAL)) {
    const url = request.nextUrl.clone();
    url.pathname = "/__not-found";
    return NextResponse.rewrite(url);
  }

  if (!isUnder(path, ADMIN_BASE)) return NextResponse.next();

  const internalPath = INTERNAL + path.slice(ADMIN_BASE.length);
  const internalUrl = request.nextUrl.clone();
  internalUrl.pathname = internalPath;
  const pass = () => (hidden ? NextResponse.rewrite(internalUrl, { request }) : NextResponse.next({ request }));

  let response = pass();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = pass();
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (internalPath !== `${INTERNAL}/login` && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `${ADMIN_BASE}/login`;
    return NextResponse.redirect(url);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  // Run on page requests only (the secret path can't be listed here because it comes from .env).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
