export type ShowConfig = {
  slug: string;
  title: string;
  description: string;
  /** Public Fireside site URL for “full archive” links */
  firesideSiteUrl: string;
  /** Env var name for RSS URL override; falls back to default Rss */
  rssEnvVar: string;
  defaultRssUrl: string;
};

export const SHOWS: ShowConfig[] = [
  {
    slug: "music-snobs",
    title: "The Music Snobs",
    description:
      "A weekly conversation about music, culture, and the records that shaped us.",
    firesideSiteUrl: "https://themusicsnobs.fireside.fm",
    rssEnvVar: "NEXT_PUBLIC_FIRESIDE_MUSIC_SNOBS_RSS",
    defaultRssUrl: "https://themusicsnobs.fireside.fm/rss",
  },
  {
    slug: "snobs-on-film",
    title: "Snobs On Film",
    description: "Film snobs talking movies, directors, and what’s worth watching.",
    firesideSiteUrl: "https://snobsonfilm.fireside.fm",
    rssEnvVar: "NEXT_PUBLIC_FIRESIDE_SNOBS_ON_FILM_RSS",
    defaultRssUrl: "https://snobsonfilm.fireside.fm/rss",
  },
];

export function getShowBySlug(slug: string): ShowConfig | undefined {
  return SHOWS.find((s) => s.slug === slug);
}

export function rssUrlForShow(show: ShowConfig): string {
  if (typeof process !== "undefined" && process.env[show.rssEnvVar]) {
    return process.env[show.rssEnvVar]!;
  }
  return show.defaultRssUrl;
}
