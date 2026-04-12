import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SHOWS } from "@/lib/shows";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 to-background">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Wildflower Media
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Podcasts and merch from the shows you love.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Catch up on The Music Snobs and Snobs On Film, then grab a tee from the
          shop.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
          >
            Shop T-shirts
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/shows"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Browse shows
          </Link>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {SHOWS.map((show) => (
            <Link
              key={show.slug}
              href={`/shows/${show.slug}`}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-muted/40"
            >
              <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary">
                {show.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {show.description}
              </p>
              <p className="mt-4 text-sm font-medium text-primary">
                Episodes →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
