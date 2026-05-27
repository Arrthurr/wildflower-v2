import Image from "next/image";
import Link from "next/link";
import type { FiresideEpisode } from "@/lib/fireside";
import type { ShowConfig } from "@/lib/shows";
import { EpisodePlayer } from "@/components/episode-player";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

export function TmsHeroSection({
  show,
  latestEpisode,
}: {
  show: ShowConfig;
  latestEpisode: FiresideEpisode | null;
}) {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-surface-bright py-margin-lg">
      <PageContainer className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
        <div className="z-10 lg:col-span-7">
          <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">
            {show.eyebrow}
          </span>
          <h1 className="mb-6 text-headline-lg-mobile text-primary sm:text-headline-lg">
            {show.title}
          </h1>
          <p className="mb-8 max-w-xl font-editorial text-editorial-body text-on-surface-variant sm:mb-12">
            {show.marketingDek}
          </p>
          {latestEpisode ? (
            <EpisodePlayer
              episode={latestEpisode}
              showEyebrow="Latest episode"
              className="max-w-2xl"
            />
          ) : (
            <p className="text-on-surface-variant">
              Episodes are loading from Fireside.{" "}
              <Link href={`/shows/${show.slug}`} className="text-tms-orange underline">
                Browse the show
              </Link>
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/shows/${show.slug}`}
              className={cn(buttonVariants({ variant: "brand", size: "lg" }), "gap-1.5")}
            >
              All episodes
              <MaterialIcon name="arrow_forward" className="text-base" />
            </Link>
            <Link
              href="/shop"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Shop merch
            </Link>
          </div>
        </div>
        <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
          <div className="relative w-full max-w-[500px]">
            <Image
              src={show.logoSrc}
              alt=""
              width={500}
              height={500}
              className="aspect-square w-full object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
