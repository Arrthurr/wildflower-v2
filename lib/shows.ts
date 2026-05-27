import { BRAND_ASSETS } from "@/lib/brand";

export type ShowBrandKey = "tms" | "sof";

export type ShowConfig = {
  slug: string;
  title: string;
  description: string;
  /** Public Fireside site URL for “full archive” links */
  firesideSiteUrl: string;
  /** Env var name for RSS URL override; falls back to default Rss */
  rssEnvVar: string;
  defaultRssUrl: string;
  brandKey: ShowBrandKey;
  logoSrc: string;
  /** Section eyebrow label (label-caps) */
  eyebrow: string;
  /** Longer marketing dek for homepage sections */
  marketingDek: string;
};

export const SHOWS: ShowConfig[] = [
  {
    slug: "music-snobs",
    title: "The Music Snobs",
    description:
      "A weekly conversation about music, culture, and the records that shaped us.",
    marketingDek:
      "The podcast for the cultured listener. No fluff, just deep dives into the music that matters. Experience high-fidelity cultural critique through an expert lens.",
    firesideSiteUrl: "https://themusicsnobs.fireside.fm",
    rssEnvVar: "NEXT_PUBLIC_FIRESIDE_MUSIC_SNOBS_RSS",
    defaultRssUrl: "https://themusicsnobs.fireside.fm/rss",
    brandKey: "tms",
    logoSrc: BRAND_ASSETS.tmsRecord,
    eyebrow: "FEATURED PODCAST",
  },
  {
    slug: "snobs-on-film",
    title: "Snobs On Film",
    description: "Film snobs talking movies, directors, and what’s worth watching.",
    marketingDek:
      "An established look at cinema through the lens of those who love it most. We break down the frame, the score, and the narrative threads that define modern filmmaking.",
    firesideSiteUrl: "https://snobsonfilm.fireside.fm",
    rssEnvVar: "NEXT_PUBLIC_FIRESIDE_SNOBS_ON_FILM_RSS",
    defaultRssUrl: "https://snobsonfilm.fireside.fm/rss",
    brandKey: "sof",
    logoSrc: BRAND_ASSETS.sofLogo,
    eyebrow: "CINEMA PERSPECTIVE",
  },
];

export const FLAGSHIP_SHOW = SHOWS[0]!;

export function getShowBySlug(slug: string): ShowConfig | undefined {
  return SHOWS.find((s) => s.slug === slug);
}

export function rssUrlForShow(show: ShowConfig): string {
  if (typeof process !== "undefined" && process.env[show.rssEnvVar]) {
    return process.env[show.rssEnvVar]!;
  }
  return show.defaultRssUrl;
}
