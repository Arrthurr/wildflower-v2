import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { MerchSection } from "@/components/marketing/merch-section";
import { MissionSection } from "@/components/marketing/mission-section";
import { SofFeatureSection } from "@/components/marketing/sof-feature-section";
import { TmsHeroSection } from "@/components/marketing/tms-hero-section";
import { fetchFiresideEpisodes } from "@/lib/fireside";
import { listSyncProducts } from "@/lib/printful";
import { getSiteUrl } from "@/lib/site-url";
import { SHOWS, rssUrlForShow } from "@/lib/shows";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const base = getSiteUrl();
  const title = "Home";
  const description =
    "Wildflower Media — The Music Snobs, Snobs On Film, and official merch.";
  return {
    title,
    description,
    alternates: { canonical: base },
    openGraph: {
      title: `${title} · Wildflower Media`,
      description,
      url: base,
      type: "website",
    },
  };
}

async function latestEpisodeForShow(slug: string) {
  const show = SHOWS.find((s) => s.slug === slug);
  if (!show) return null;
  try {
    const episodes = await fetchFiresideEpisodes(rssUrlForShow(show), { limit: 1 });
    return episodes[0] ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const tmsShow = SHOWS.find((s) => s.brandKey === "tms")!;
  const sofShow = SHOWS.find((s) => s.brandKey === "sof")!;

  const [tmsEpisode, sofEpisode, merchResult] = await Promise.all([
    latestEpisodeForShow(tmsShow.slug),
    latestEpisodeForShow(sofShow.slug),
    listSyncProducts()
      .then((products) => ({ products, error: null as string | null }))
      .catch((e: unknown) => ({
        products: [] as Awaited<ReturnType<typeof listSyncProducts>>,
        error: e instanceof Error ? e.message : "Could not load products.",
      })),
  ]);

  return (
    <>
      <TmsHeroSection show={tmsShow} latestEpisode={tmsEpisode} />
      <SofFeatureSection show={sofShow} latestEpisode={sofEpisode} />
      <MerchSection products={merchResult.products} error={merchResult.error} />
      <MissionSection />
      <SiteFooter />
    </>
  );
}
