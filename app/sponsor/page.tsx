import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SponsorForm } from "@/components/sponsor-form";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = `${getSiteUrl()}/sponsor`;
  const title = "Sponsor";
  const description =
    "Interested in sponsoring The Music Snobs or Snobs On Film? Get in touch.";
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

export default function SponsorPage() {
  return (
    <>
      <PageContainer className="max-w-3xl py-margin-md">
        <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">
          PARTNERSHIPS
        </span>
        <h1 className="text-headline-lg-mobile text-primary sm:text-headline-lg">
          Sponsor our shows
        </h1>
        <p className="mt-4 max-w-xl font-editorial text-editorial-body text-on-surface-variant">
          Interested in reaching listeners of The Music Snobs or Snobs On Film? Tell us a
          bit about your brand and we will follow up. There is no self-serve checkout — we
          reply to every serious inquiry.
        </p>
        <SponsorForm />
      </PageContainer>
      <SiteFooter />
    </>
  );
}
