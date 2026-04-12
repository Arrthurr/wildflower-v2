import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EpisodeCard } from "@/components/episode-card";
import { fetchFiresideEpisodes } from "@/lib/fireside";
import { getShowBySlug, rssUrlForShow, SHOWS } from "@/lib/shows";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return SHOWS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const show = getShowBySlug(slug);
  if (!show) return { title: "Show" };
  const canonical = `${getSiteUrl()}/shows/${show.slug}`;
  return {
    title: show.title,
    description: show.description,
    alternates: { canonical },
    openGraph: {
      title: show.title,
      description: show.description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function ShowPage(props: Props) {
  const { slug } = await props.params;
  const show = getShowBySlug(slug);
  if (!show) notFound();

  const shareBaseUrl = `${getSiteUrl()}/shows/${show.slug}`;

  let episodes: Awaited<ReturnType<typeof fetchFiresideEpisodes>> = [];
  try {
    episodes = await fetchFiresideEpisodes(rssUrlForShow(show), {
      limit: 20,
    });
  } catch {
    episodes = [];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{show.title}</h1>
        <p className="text-muted-foreground">{show.description}</p>
        <p>
          <a
            href={show.firesideSiteUrl}
            className="text-sm font-medium text-primary underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            Full archive on Fireside
          </a>
        </p>
      </div>

      {episodes.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          Episodes could not be loaded right now.{" "}
          <Link
            href={show.firesideSiteUrl}
            className="underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            Open the show on Fireside
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10">
          {episodes.map((ep) => (
            <EpisodeCard
              key={ep.guid}
              episode={ep}
              darkPlayer
              showSlug={show.slug}
              shareBaseUrl={shareBaseUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
