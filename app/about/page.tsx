import type { Metadata } from "next";
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
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">About Wildflower</h1>
      <div className="mt-8 space-y-6">
        <p className="text-muted-foreground leading-relaxed">
          Wildflower Media is an independent podcast network focused on sharp
          conversation — whether the topic is music or movies. We produce{" "}
          <strong>The Music Snobs</strong> and <strong>Snobs On Film</strong>,
          release episodes on Fireside, and offer merch here on this site.
        </p>
        <h2 className="text-xl font-semibold">The shows</h2>
        <p className="text-muted-foreground leading-relaxed">
          <strong>The Music Snobs</strong> is a weekly conversation about music,
          culture, and the records that shaped us.{" "}
          <strong>Snobs On Film</strong> brings the same energy to the movies
          worth arguing about.
        </p>
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For sponsorship or general questions, visit the{" "}
          <a className="text-primary underline underline-offset-4" href="/sponsor">
            sponsor
          </a>{" "}
          page. For episode archives and RSS, each show page links out to
          Fireside.
        </p>
      </div>
    </div>
  );
}
