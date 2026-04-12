import Link from "next/link";
import type { Metadata } from "next";
import { SHOWS } from "@/lib/shows";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Shows",
  description: "Podcasts from Wildflower Media on Fireside.",
};

export default function ShowsIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Shows</h1>
      <p className="mt-2 text-muted-foreground">
        Two podcasts, one network. Pick a show for episodes and the Fireside
        player.
      </p>
      <ul className="mt-8 flex flex-col gap-4">
        {SHOWS.map((show) => (
          <li key={show.slug}>
            <Link href={`/shows/${show.slug}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle>{show.title}</CardTitle>
                  <CardDescription>{show.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
