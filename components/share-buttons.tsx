"use client";

import { useMutation } from "convex/react";
import { Copy, Link2, Share2 } from "lucide-react";
import { useCallback, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

type Props = {
  showSlug: string;
  episodeSlug: string;
  episodeTitle: string;
  shareUrl: string;
};

export function ShareButtons({
  showSlug,
  episodeSlug,
  episodeTitle,
  shareUrl,
}: Props) {
  const recordShare = useMutation(api.shareEvents.recordShare);
  const [copied, setCopied] = useState(false);

  const track = useCallback(
    async (platform: string) => {
      try {
        await recordShare({
          showSlug,
          episodeSlug,
          episodeTitle,
          platform,
        });
      } catch {
        /* non-blocking analytics */
      }
    },
    [recordShare, showSlug, episodeSlug, episodeTitle],
  );

  const shareTwitter = () => {
    const text = episodeTitle;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    void track("twitter");
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    void track("facebook");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      void track("copy_link");
    } catch {
      void track("copy_link_failed");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Share</span>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="gap-1"
        onClick={shareTwitter}
        aria-label="Share on X"
      >
        <span className="text-[0.65rem] font-semibold" aria-hidden>
          X
        </span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="gap-1"
        onClick={shareFacebook}
        aria-label="Share on Facebook"
      >
        <Share2 className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="gap-1"
        onClick={() => void copyLink()}
        aria-label="Copy episode link"
      >
        {copied ? (
          <>
            <Link2 className="size-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="size-3.5" />
            Copy link
          </>
        )}
      </Button>
    </div>
  );
}
