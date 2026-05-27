import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { BRAND } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = `${getSiteUrl()}/about`;
  const title = "About";
  const description =
    "Wildflower Media produces The Music Snobs and Snobs On Film.";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · Wildflower Media`,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default function AboutPage() {
  return (
    <>
      <PageContainer className="max-w-3xl py-margin-md">
        <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">
          NETWORK
        </span>
        <h1 className="text-headline-lg-mobile text-primary sm:text-headline-lg">
          About Wildflower
        </h1>
        <div className="mt-8 space-y-6">
          <p className="font-editorial text-editorial-body leading-relaxed text-on-surface-variant">
            Wildflower Media is an independent podcast network focused on sharp
            conversation — whether the topic is music or movies. We produce{" "}
            <strong className="text-primary">The Music Snobs</strong> and{" "}
            <strong className="text-primary">Snobs On Film</strong>, release episodes on
            Fireside, and offer merch here on this site.
          </p>
          <h2 className="text-xl font-semibold text-primary">The shows</h2>
          <p className="font-editorial text-editorial-body leading-relaxed text-on-surface-variant">
            <strong className="text-primary">The Music Snobs</strong> is a weekly
            conversation about music, culture, and the records that shaped us.{" "}
            <strong className="text-primary">Snobs On Film</strong> brings the same energy
            to the movies worth arguing about.
          </p>
          <h2 className="text-xl font-semibold text-primary">Contact</h2>
          <p className="font-editorial text-editorial-body leading-relaxed text-on-surface-variant">
            For sponsorship or general questions, visit the{" "}
            <Link
              className="text-tms-orange underline underline-offset-4"
              href="/sponsor"
            >
              sponsor
            </Link>{" "}
            page. For episode archives and RSS, each show page links out to Fireside.
          </p>
          <p className="text-label-caps text-on-surface-variant">{BRAND.tagline}</p>
        </div>
      </PageContainer>
      <SiteFooter />
    </>
  );
}
