import Image from "next/image";
import Link from "next/link";
import type { FiresideEpisode } from "@/lib/fireside";
import type { ShowConfig } from "@/lib/shows";
import { EpisodePlayer } from "@/components/episode-player";
import { PageContainer } from "@/components/layout/page-container";
import { MaterialIcon } from "@/components/ui/material-icon";
import { BRAND_ASSETS } from "@/lib/brand";

export function SofFeatureSection({
  show,
  latestEpisode,
}: {
  show: ShowConfig;
  latestEpisode: FiresideEpisode | null;
}) {
  return (
    <section className="bg-sof-navy py-margin-lg text-white">
      <PageContainer>
        <div className="grid grid-cols-1 items-center gap-margin-lg md:grid-cols-2">
          <div className="order-2 flex justify-center md:order-1">
            <Image
              src={BRAND_ASSETS.sofLogo}
              alt={show.title}
              width={400}
              height={200}
              className="mx-auto w-full max-w-[400px] object-contain brightness-0 invert opacity-90 drop-shadow-xl"
            />
          </div>
          <div className="order-1 md:order-2">
            <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">
              {show.eyebrow}
            </span>
            <h2 className="mb-6 text-headline-lg-mobile sm:text-headline-lg">{show.title}</h2>
            <p className="mb-8 max-w-xl font-editorial text-editorial-body text-primary-fixed sm:mb-10">
              {show.marketingDek}
            </p>
            {latestEpisode ? (
              <EpisodePlayer episode={latestEpisode} dark variant="on-dark" />
            ) : null}
            <Link
              href={`/shows/${show.slug}`}
              className="mt-8 inline-flex items-center gap-2 text-label-caps text-white transition-colors hover:text-tms-orange"
            >
              View episodes
              <MaterialIcon
                name="arrow_forward"
                className="text-sm transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
