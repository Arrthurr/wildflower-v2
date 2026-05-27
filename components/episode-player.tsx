import type { FiresideEpisode } from "@/lib/fireside";
import { cn } from "@/lib/utils";

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
  showEyebrow,
  variant = "light",
  className,
}: {
  episode: FiresideEpisode;
  dark?: boolean;
  showEyebrow?: string;
  variant?: "light" | "on-dark";
  className?: string;
}) {
  const shellClass =
    variant === "on-dark"
      ? "rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-sm sm:p-6"
      : "glass-player rounded-xl border border-outline-variant p-4 shadow-sm sm:p-6";
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
      <div className={cn(shellClass, className)}>
        {(showEyebrow || episode.title) && (
          <div className="mb-4 space-y-1">
            {showEyebrow ? (
              <p className="text-label-caps tracking-widest text-tms-orange">
                {showEyebrow}
              </p>
            ) : null}
            <h3
              className={cn(
                "line-clamp-2 text-ui-medium font-medium",
                variant === "on-dark" ? "text-white" : "text-primary",
              )}
            >
              {episode.title}
            </h3>
          </div>
        )}
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <iframe
            title={episode.title}
            src={iframeSrc}
            className="h-full w-full"
            allow="autoplay"
          />
        </div>
      </div>
    );
  }

  if (episode.audioUrl) {
    return (
      <div className={cn(shellClass, className)}>
        {episode.title ? (
          <h3
            className={cn(
              "mb-3 text-ui-medium font-medium",
              variant === "on-dark" ? "text-white" : "text-primary",
            )}
          >
            {episode.title}
          </h3>
        ) : null}
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
        className="underline underline-offset-4 hover:text-tms-orange"
        target="_blank"
        rel="noreferrer"
      >
        Listen on Fireside
      </a>
    </p>
  );
}
