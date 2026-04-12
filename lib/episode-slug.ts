import type { FiresideEpisode } from "@/lib/fireside";

/** Stable slug for anchors, share tracking, and URLs (last path segment of Fireside link when possible). */
export function episodeSlugFromFireside(ep: FiresideEpisode): string {
  if (ep.link) {
    try {
      const parts = new URL(ep.link).pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last) return decodeURIComponent(last);
    } catch {
      /* fall through */
    }
  }
  return ep.guid.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120);
}

/** URL- and DOM-safe fragment for `id="episode-…"` and share hashes. */
export function episodeAnchorId(ep: FiresideEpisode): string {
  const raw = episodeSlugFromFireside(ep);
  const safe = raw
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  if (safe.length > 0) return safe;
  return `g-${ep.guid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40)}`;
}
