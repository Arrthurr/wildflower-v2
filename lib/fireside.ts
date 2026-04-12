import Parser from "rss-parser";

export type FiresideEpisode = {
  guid: string;
  title: string;
  description: string;
  pubDate: string;
  link: string;
  audioUrl?: string;
  artworkUrl?: string;
  playerUrl?: string;
  embedHtml?: string;
};

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  enclosure?: { url?: string };
  itunes?: { image?: string; duration?: string };
  "content:encoded"?: string;
  "content:encodedSnippet"?: string;
  firesidePlayerUrl?: string;
  firesidePlayerEmbedCode?: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function createParser(): Parser<RssItem> {
  return new Parser<RssItem>({
    customFields: {
      item: [
        ["fireside:playerUrl", "firesidePlayerUrl"],
        ["fireside:playerEmbedCode", "firesidePlayerEmbedCode"],
      ],
    },
  });
}

export async function parseFiresideFeedXml(
  xml: string,
): Promise<FiresideEpisode[]> {
  const parser = createParser();
  const feed = (await parser.parseString(xml)) as { items?: RssItem[] };
  return normalizeItems(feed.items ?? []);
}

export async function fetchFiresideEpisodes(
  rssUrl: string,
  options?: { limit?: number },
): Promise<FiresideEpisode[]> {
  const limit = options?.limit ?? 20;
  const res = await fetch(rssUrl, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
  });
  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();
  const parser = createParser();
  const feed = await parser.parseString(xml);
  const items = (feed.items ?? []) as RssItem[];
  return normalizeItems(items).slice(0, limit);
}

function normalizeItems(items: RssItem[]): FiresideEpisode[] {
  const out: FiresideEpisode[] = [];
  for (const item of items) {
    const title = item.title?.trim();
    if (!title) continue;

    const guid =
      typeof item.guid === "string" && item.guid.trim().length > 0
        ? item.guid.trim()
        : item.link ?? title;

    const descriptionRaw =
      item["content:encoded"] ??
      item.content ??
      item.contentSnippet ??
      item["content:encodedSnippet"] ??
      "";
    const description = stripHtml(descriptionRaw).slice(0, 2000);

    const audioUrl = item.enclosure?.url;
    const artworkUrl = item.itunes?.image;

    const embedFromContent = extractIframeSrcFromEmbed(
      item.firesidePlayerEmbedCode ?? item["content:encoded"] ?? item.content,
    );
    const playerUrl =
      item.firesidePlayerUrl ?? embedFromContent ?? item.link ?? "";

    const embedHtml = sanitizeEmbedHtml(item.firesidePlayerEmbedCode);

    out.push({
      guid,
      title,
      description,
      pubDate: item.pubDate ?? "",
      link: item.link ?? "",
      audioUrl,
      artworkUrl,
      playerUrl: playerUrl || undefined,
      embedHtml,
    });
  }
  return out;
}

function extractIframeSrcFromEmbed(raw?: string): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/src=["']([^"']+)["']/i);
  return match?.[1];
}

/** Allow only iframe embeds pointing at Fireside player hosts */
function sanitizeEmbedHtml(raw?: string): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed.toLowerCase().startsWith("<iframe")) return undefined;
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const src = srcMatch?.[1];
  if (!src) return undefined;
  try {
    const host = new URL(src).hostname;
    if (!host.endsWith("fireside.fm") && !host.endsWith("fireside.fm.")) {
      return undefined;
    }
  } catch {
    return undefined;
  }
  return trimmed;
}
