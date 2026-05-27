import type { FiresideEpisode } from "@/lib/fireside";
import type { ShowConfig } from "@/lib/shows";
import { EpisodePlayer } from "@/components/episode-player";
import { ShareButtons } from "@/components/share-buttons";
import { episodeAnchorId } from "@/lib/episode-slug";

export function EpisodeCard({
  episode,
  show,
  shareBaseUrl,
}: {
  episode: FiresideEpisode;
  show: ShowConfig;
  shareBaseUrl: string;
}) {
  const anchor = episodeAnchorId(episode);
  const shareUrl = `${shareBaseUrl.replace(/\/$/, "")}#episode-${anchor}`;
  const darkPlayer = show.brandKey === "sof";

  return (
    <article
      id={`episode-${anchor}`}
      className="flex scroll-mt-24 flex-col gap-4 border-b border-outline-variant py-8 last:border-b-0"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        {episode.artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- RSS artwork hosts vary
          <img
            src={episode.artworkUrl}
            alt=""
            width={144}
            height={144}
            className="h-36 w-36 shrink-0 rounded-md bg-muted object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-lg font-semibold leading-snug tracking-tight text-primary">
            {episode.title}
          </h2>
          {episode.pubDate ? (
            <p className="text-xs text-on-surface-variant">
              {new Date(episode.pubDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          ) : null}
          {episode.description ? (
            <p className="line-clamp-4 text-sm text-on-surface-variant">
              {episode.description}
            </p>
          ) : null}
        </div>
      </div>
      <EpisodePlayer episode={episode} dark={darkPlayer} />
      <ShareButtons
        showSlug={show.slug}
        episodeSlug={anchor}
        episodeTitle={episode.title}
        shareUrl={shareUrl}
      />
    </article>
  );
}
