"use client";

import { useEffect } from "react";

// Records how people read a post: view, scroll depth, ACTIVE time on page, and link/button clicks.
// Events go to the track_event() function in Supabase (see supabase/schema.sql).
export function Tracker({ postId }: { postId: string }) {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    // One session id per browser tab session
    let session = "";
    try {
      session = sessionStorage.getItem("si_session") || "";
      if (!session) {
        session = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem("si_session", session);
      }
    } catch {
      session = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    const device = window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";

    function send(event: "view" | "scroll" | "time" | "click", value?: number, meta?: Record<string, unknown>) {
      fetch(`${url}/rest/v1/rpc/track_event`, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json", apikey: key!, Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          p_post_id: postId,
          p_session_id: session,
          p_event: event,
          p_value: value ?? null,
          p_meta: meta ?? {},
          p_referrer: document.referrer || null,
          p_device: device,
        }),
      }).catch(() => {});
    }

    send("view");

    // ---- scroll depth (25 / 50 / 75 / 100 % of the article) ----
    const marks = [25, 50, 75, 100];
    const reached = new Set<number>();
    function onScroll() {
      const body = document.getElementById("post-body");
      if (!body) return;
      const rect = body.getBoundingClientRect();
      const total = rect.height;
      if (total <= 0) return;
      const seen = Math.min(Math.max(window.innerHeight - rect.top, 0), total);
      const pct = (seen / total) * 100;
      for (const m of marks) {
        if (pct >= m - 1 && !reached.has(m)) {
          reached.add(m);
          send("scroll", m);
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ---- active time: only counts while the tab is visible AND the reader did something in the last 30s ----
    let active = 0;
    let lastActivity = Date.now();
    let lastSent = 0;
    const bump = () => {
      lastActivity = Date.now();
    };
    ["scroll", "mousemove", "keydown", "touchstart", "click"].forEach((e) =>
      window.addEventListener(e, bump, { passive: true })
    );

    const tick = window.setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastActivity < 30000) active += 1;
    }, 1000);

    const flush = window.setInterval(() => {
      if (active > lastSent) {
        lastSent = active;
        send("time", active);
      }
    }, 10000);

    function finish() {
      if (active > lastSent) {
        lastSent = active;
        send("time", active);
      }
    }
    const onVis = () => {
      if (document.visibilityState === "hidden") finish();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", finish);

    // ---- clicks on links and buttons inside the article ----
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!el) return;
      const block = el.closest("[data-block]") as HTMLElement | null;
      send("click", undefined, {
        href: el.getAttribute("href"),
        text: (el.textContent || "").trim().slice(0, 80),
        block: block?.dataset.block ?? null,
        type: block?.dataset.type ?? null,
      });
    }
    const body = document.getElementById("post-body");
    body?.addEventListener("click", onClick);

    return () => {
      finish();
      window.removeEventListener("scroll", onScroll);
      ["scroll", "mousemove", "keydown", "touchstart", "click"].forEach((e) => window.removeEventListener(e, bump));
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", finish);
      body?.removeEventListener("click", onClick);
      window.clearInterval(tick);
      window.clearInterval(flush);
    };
  }, [postId]);

  return null;
}
