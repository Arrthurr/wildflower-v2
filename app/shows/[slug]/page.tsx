import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EpisodeCard } from "@/components/episode-card";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { fetchFiresideEpisodes } from "@/lib/fireside";
import { getShowBySlug, rssUrlForShow, SHOWS } from "@/lib/shows";
import { getSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

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

  const isTms = show.brandKey === "tms";

  return (
    <>
      <div
        className={cn(
          "border-b border-outline-variant py-margin-md",
          isTms ? "bg-surface-bright" : "bg-sof-navy text-white",
        )}
      >
        <PageContainer>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Image
              src={show.logoSrc}
              alt=""
              width={160}
              height={160}
              className={cn(
                "h-32 w-auto object-contain",
                !isTms && "brightness-0 invert",
              )}
            />
            <div className="space-y-2">
              <span
                className={cn(
                  "text-label-caps tracking-widest",
                  isTms ? "text-tms-orange" : "text-primary-fixed",
                )}
              >
                {show.eyebrow}
              </span>
              <h1 className="text-headline-lg-mobile sm:text-headline-lg">{show.title}</h1>
              <p
                className={cn(
                  "max-w-2xl font-editorial text-editorial-body",
                  isTms ? "text-on-surface-variant" : "text-primary-fixed",
                )}
              >
                {show.description}
              </p>
              <a
                href={show.firesideSiteUrl}
                className="inline-block text-sm font-medium text-tms-orange underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                Full archive on Fireside
              </a>
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-10">
        {episodes.length === 0 ? (
          <p className="text-on-surface-variant">
            Episodes could not be loaded right now.{" "}
            <Link
              href={show.firesideSiteUrl}
              className="underline underline-offset-4 hover:text-tms-orange"
              target="_blank"
              rel="noreferrer"
            >
              Open the show on Fireside
            </Link>
            .
          </p>
        ) : (
          <div>
            {episodes.map((ep) => (
              <EpisodeCard
                key={ep.guid}
                episode={ep}
                show={show}
                shareBaseUrl={shareBaseUrl}
              />
            ))}
          </div>
        )}
      </PageContainer>
      <SiteFooter />
    </>
  );
}
