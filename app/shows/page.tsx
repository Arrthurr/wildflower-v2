import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SHOWS } from "@/lib/shows";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shows",
  description: "Podcasts from Wildflower Media on Fireside.",
};

export default function ShowsIndexPage() {
  return (
    <>
      <div className="border-b border-outline-variant bg-surface-bright py-margin-md">
        <PageContainer>
          <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">
            PODCASTS
          </span>
          <h1 className="text-headline-lg-mobile text-primary sm:text-headline-lg">Shows</h1>
          <p className="mt-4 max-w-2xl font-editorial text-editorial-body text-on-surface-variant">
            Two podcasts, one network. Pick a show for episodes and the Fireside player.
          </p>
        </PageContainer>
      </div>
      <PageContainer className="py-margin-md">
        <ul className="grid gap-gutter sm:grid-cols-2">
          {SHOWS.map((show) => (
            <li key={show.slug}>
              <Link
                href={`/shows/${show.slug}`}
                className={cn(
                  "group block overflow-hidden rounded-xl border border-outline-variant p-6 transition-colors",
                  show.brandKey === "tms"
                    ? "bg-tms-orange-tint ring-1 ring-tms-orange/20 hover:border-tms-orange"
                    : "bg-sof-navy text-white hover:border-tms-orange",
                )}
              >
                <Image
                  src={show.logoSrc}
                  alt=""
                  width={120}
                  height={120}
                  className={cn(
                    "mb-4 h-24 w-auto object-contain",
                    show.brandKey === "sof" && "brightness-0 invert",
                  )}
                />
                <h2 className="text-xl font-semibold tracking-tight group-hover:text-tms-orange">
                  {show.title}
                </h2>
                <p
                  className={cn(
                    "mt-2 text-sm",
                    show.brandKey === "tms"
                      ? "text-on-surface-variant"
                      : "text-primary-fixed",
                  )}
                >
                  {show.description}
                </p>
                <p className="mt-4 text-sm font-medium text-tms-orange">Episodes →</p>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
      <SiteFooter />
    </>
  );
}
