import type { MetadataRoute } from "next";
import { SHOWS } from "@/lib/shows";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/shows`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${base}/shop`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    {
      url: `${base}/sponsor`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const showRoutes: MetadataRoute.Sitemap = SHOWS.map((s) => ({
    url: `${base}/shows/${s.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...showRoutes];
}
