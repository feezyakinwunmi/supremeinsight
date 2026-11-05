// Remembers where a reader stopped in each article, in this browser only (localStorage).
// Nothing is sent to the server.

export type SavedSpot = {
  slug: string;
  title: string;
  cover: string | null;
  department: string | null;
  color: string | null;
  blockId: string | null; // first block that was on screen
  percent: number; // 0-100, how far through the article
  updatedAt: number;
};

const KEY = "si_reading_progress";
const MAX_ITEMS = 20;
const MAX_AGE = 1000 * 60 * 60 * 24 * 60; // forget after 60 days

export function loadSpots(): Record<string, SavedSpot> {
  try {
    const raw = window.localStorage.getItem(KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, SavedSpot>) : {};
    const now = Date.now();
    for (const k of Object.keys(all)) if (now - all[k].updatedAt > MAX_AGE) delete all[k];
    return all;
  } catch {
    return {};
  }
}

function write(all: Record<string, SavedSpot>) {
  try {
    const kept = Object.values(all)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_ITEMS);
    window.localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(kept.map((s) => [s.slug, s]))));
  } catch {
    // storage full or blocked: resume simply won't be offered
  }
}

export function saveSpot(spot: SavedSpot) {
  const all = loadSpots();
  all[spot.slug] = spot;
  write(all);
}

export function clearSpot(slug: string) {
  const all = loadSpots();
  delete all[slug];
  write(all);
}

/** Articles started but not finished, newest first. */
export function inProgress(limit = 3): SavedSpot[] {
  return Object.values(loadSpots())
    .filter((s) => s.percent >= 5 && s.percent < 95)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit);
}
