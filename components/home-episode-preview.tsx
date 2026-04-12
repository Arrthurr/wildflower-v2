import Link from "next/link";
import type { FiresideEpisode } from "@/lib/fireside";
import { ShareButtons } from "@/components/share-buttons";
import { episodeAnchorId } from "@/lib/episode-slug";

export function HomeEpisodePreview({
  episode,
  showSlug,
  showTitle,
  shareBaseUrl,
}: {
  episode: FiresideEpisode;
  showSlug: string;
  showTitle: string;
  shareBaseUrl: string;
}) {
  const anchor = episodeAnchorId(episode);
  const shareUrl = `${shareBaseUrl.replace(/\/$/, "")}#episode-${anchor}`;

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card/50 p-4">
      {episode.artworkUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- RSS artwork hosts vary
        <img
          src={episode.artworkUrl}
          alt=""
          width={80}
          height={80}
          className="size-20 shrink-0 rounded-md object-cover bg-muted"
        />
      ) : null}
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{showTitle}</p>
        <h3 className="font-semibold leading-snug tracking-tight">
          <Link
            href={`/shows/${showSlug}#episode-${anchor}`}
            className="hover:text-primary hover:underline"
          >
            {episode.title}
          </Link>
        </h3>
        {episode.pubDate ? (
          <p className="text-xs text-muted-foreground">
            {new Date(episode.pubDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        ) : null}
        <ShareButtons
          showSlug={showSlug}
          episodeSlug={anchor}
          episodeTitle={episode.title}
          shareUrl={shareUrl}
        />
      </div>
    </div>
  );
}
