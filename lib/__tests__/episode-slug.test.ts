import { describe, expect, it } from "vitest";
import type { FiresideEpisode } from "@/lib/fireside";
import { episodeAnchorId, episodeSlugFromFireside } from "@/lib/episode-slug";

function ep(partial: Partial<FiresideEpisode> & Pick<FiresideEpisode, "guid">) {
  return {
    title: "T",
    description: "",
    pubDate: "",
    link: "",
    ...partial,
  } satisfies FiresideEpisode;
}

describe("episodeSlugFromFireside", () => {
  it("uses last path segment from Fireside link", () => {
    expect(
      episodeSlugFromFireside(
        ep({
          guid: "g",
          link: "https://show.fireside.fm/my-episode-slug",
        }),
      ),
    ).toBe("my-episode-slug");
  });
});

describe("episodeAnchorId", () => {
  it("sanitizes for DOM and URL fragments", () => {
    expect(
      episodeAnchorId(
        ep({
          guid: "abc",
          link: "https://show.fireside.fm/hello/world",
        }),
      ),
    ).toBe("world");
  });
});
