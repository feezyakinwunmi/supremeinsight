// The staff area is served from a secret URL set in NEXT_PUBLIC_ADMIN_PATH (e.g. "desk-7f3k9q").
// Visiting /admin directly returns a 404, so the panel can't be found by guessing.
// Change the value in .env (and restart / redeploy) to move the panel to a new address.
const raw = (process.env.NEXT_PUBLIC_ADMIN_PATH || "admin").trim().replace(/^\/+|\/+$/g, "");

export const ADMIN_BASE = `/${raw || "admin"}`;

/** Public URL for a page inside the staff area, e.g. adminHref("/posts/new"). */
export function adminHref(path = "") {
  return `${ADMIN_BASE}${path}`;
}
