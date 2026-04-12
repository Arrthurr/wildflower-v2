import type { FiresideEpisode } from "@/lib/fireside";
import { EpisodePlayer } from "@/components/episode-player";
import { ShareButtons } from "@/components/share-buttons";
import { episodeAnchorId } from "@/lib/episode-slug";

export function EpisodeCard({
  episode,
  darkPlayer,
  showSlug,
  shareBaseUrl,
}: {
  episode: FiresideEpisode;
  darkPlayer?: boolean;
  /** When set with shareBaseUrl, shows share actions and a stable anchor id. */
  showSlug?: string;
  /** Site origin + path through `/shows/[slug]` (no hash); hash is added from the episode. */
  shareBaseUrl?: string;
}) {
  const anchor = episodeAnchorId(episode);
  const shareUrl =
    showSlug && shareBaseUrl
      ? `${shareBaseUrl.replace(/\/$/, "")}#episode-${anchor}`
      : undefined;

  return (
    <article
      id={shareUrl ? `episode-${anchor}` : undefined}
      className="flex scroll-mt-24 flex-col gap-4 border-b border-border py-8 last:border-b-0"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        {episode.artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- RSS artwork hosts vary; avoid wide remotePatterns.
          <img
            src={episode.artworkUrl}
            alt=""
            width={144}
            height={144}
            className="h-36 w-36 shrink-0 rounded-md object-cover bg-muted"
          />
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-lg font-semibold leading-snug tracking-tight">
            {episode.title}
          </h2>
          {episode.pubDate ? (
            <p className="text-xs text-muted-foreground">
              {new Date(episode.pubDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          ) : null}
          {episode.description ? (
            <p className="text-sm text-muted-foreground line-clamp-4">
              {episode.description}
            </p>
          ) : null}
        </div>
      </div>
      <EpisodePlayer episode={episode} dark={darkPlayer} />
      {showSlug && shareUrl ? (
        <ShareButtons
          showSlug={showSlug}
          episodeSlug={anchor}
          episodeTitle={episode.title}
          shareUrl={shareUrl}
        />
      ) : null}
    </article>
  );
}
