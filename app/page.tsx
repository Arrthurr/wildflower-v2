import type { Metadata } from "next";
import { HeroSection } from "@/components/hero-section";
import { HomeEpisodePreview } from "@/components/home-episode-preview";
import { fetchFiresideEpisodes } from "@/lib/fireside";
import { rssUrlForShow, SHOWS } from "@/lib/shows";
import { getSiteUrl } from "@/lib/site-url";
import Link from "next/link";

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

async function latestForShow(slug: string) {
  const show = SHOWS.find((s) => s.slug === slug);
  if (!show) return [];
  try {
    return await fetchFiresideEpisodes(rssUrlForShow(show), { limit: 5 });
  } catch {
    return [];
  }
}

export default async function Home() {
  const siteUrl = getSiteUrl();
  const byShow = await Promise.all(
    SHOWS.map(async (show) => ({
      show,
      episodes: await latestForShow(show.slug),
    })),
  );

  const anyEpisodes = byShow.some((b) => b.episodes.length > 0);

  return (
    <div className="flex flex-col">
      <HeroSection />

      <section className="mx-auto w-full max-w-5xl px-4 py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Latest episodes
            </h2>
            <p className="mt-1 text-muted-foreground">
              Fresh from the Fireside feeds. Open a show for the full player.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Shop T-shirts →
          </Link>
        </div>

        {!anyEpisodes ? (
          <p className="mt-8 text-muted-foreground">
            Episodes are not available right now. You can still{" "}
            <Link href="/shop" className="underline underline-offset-4">
              browse the shop
            </Link>{" "}
            or open a show on Fireside from the cards above.
          </p>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {byShow.map(({ show, episodes }) => {
              const shareBase = `${siteUrl}/shows/${show.slug}`;
              return (
                <div key={show.slug} className="space-y-4">
                  <h3 className="text-lg font-semibold">{show.title}</h3>
                  {episodes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No episodes loaded.{" "}
                      <Link
                        href={`/shows/${show.slug}`}
                        className="underline underline-offset-4"
                      >
                        Try the show page
                      </Link>
                      .
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {episodes.map((ep) => (
                        <li key={ep.guid}>
                          <HomeEpisodePreview
                            episode={ep}
                            showSlug={show.slug}
                            showTitle={show.title}
                            shareBaseUrl={shareBase}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
