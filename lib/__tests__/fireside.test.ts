import { describe, expect, it } from "vitest";
import { parseFiresideFeedXml } from "@/lib/fireside";

const FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:fireside="https://fireside.fm"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Test Show</title>
    <item>
      <title>Episode One</title>
      <link>https://example.fireside.fm/1</link>
      <guid isPermaLink="false">ep-1</guid>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
      <enclosure url="https://cdn.example/audio.mp3" type="audio/mpeg" length="123"/>
      <itunes:image href="https://cdn.example/art.jpg"/>
      <fireside:playerUrl>https://player.fireside.fm/v1/abc</fireside:playerUrl>
      <fireside:playerEmbedCode><![CDATA[<iframe src="https://player.fireside.fm/v1/abc"></iframe>]]></fireside:playerEmbedCode>
    </item>
    <item>
      <title></title>
    </item>
  </channel>
</rss>`;

describe("parseFiresideFeedXml", () => {
  it("extracts Fireside fields and skips empty items", async () => {
    const episodes = await parseFiresideFeedXml(FIXTURE);
    expect(episodes).toHaveLength(1);
    const ep = episodes[0]!;
    expect(ep.title).toBe("Episode One");
    expect(ep.guid).toBe("ep-1");
    expect(ep.audioUrl).toBe("https://cdn.example/audio.mp3");
    expect(ep.playerUrl).toContain("player.fireside.fm");
    expect(ep.embedHtml).toContain("iframe");
  });
});
