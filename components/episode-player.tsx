import type { FiresideEpisode } from "@/lib/fireside";

function iframeSrcFromEpisode(episode: FiresideEpisode): string | undefined {
  if (episode.embedHtml) {
    const m = episode.embedHtml.match(/src=["']([^"']+)["']/i);
    if (m?.[1]) return m[1];
  }
  if (episode.playerUrl) {
    try {
      const u = new URL(episode.playerUrl);
      if (u.hostname.includes("fireside.fm")) return episode.playerUrl;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function EpisodePlayer({
  episode,
  dark,
}: {
  episode: FiresideEpisode;
  dark?: boolean;
}) {
  const src = iframeSrcFromEpisode(episode);

  if (src) {
    let iframeSrc = src;
    if (dark) {
      try {
        const u = new URL(src);
        u.searchParams.set("theme", "dark");
        iframeSrc = u.toString();
      } catch {
        iframeSrc = src;
      }
    }

    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
        <iframe
          title={episode.title}
          src={iframeSrc}
          className="h-full w-full"
          allow="autoplay"
        />
      </div>
    );
  }

  if (episode.audioUrl) {
    return (
      <div className="rounded-lg border border-border bg-muted p-4">
        <audio controls className="w-full" preload="none">
          <source src={episode.audioUrl} />
        </audio>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      <a
        href={episode.link || "#"}
        className="underline underline-offset-4"
        target="_blank"
        rel="noreferrer"
      >
        Listen on Fireside
      </a>
    </p>
  );
}
