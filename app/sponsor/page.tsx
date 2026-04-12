import type { Metadata } from "next";
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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Sponsor our shows
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
        Interested in reaching listeners of The Music Snobs or Snobs On Film?
        Tell us a bit about your brand and we will follow up. There is no
        self-serve checkout — we reply to every serious inquiry.
      </p>
      <SponsorForm />
    </div>
  );
}
