/**
 * Canonical site origin for metadata, sitemap, and share URLs.
 * Set `NEXT_PUBLIC_SITE_URL` in production (e.g. https://wildflowerpodcasts.com).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}
