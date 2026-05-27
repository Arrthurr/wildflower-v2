import Link from "next/link";
import type { PrintfulListRow } from "@/lib/printful-types";

export function ProductCard({ product }: { product: PrintfulListRow }) {
  return (
    <Link href={`/shop/${product.id}`} className="group block cursor-pointer">
      <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container-low ring-1 ring-outline-variant transition-all group-hover:ring-tms-orange/30">
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>
      <h4 className="mb-1 text-ui-medium text-primary transition-colors group-hover:text-tms-orange">
        {product.name}
      </h4>
      {product.variants != null ? (
        <p className="text-label-caps text-on-surface-variant">
          {product.synced ?? product.variants} variant
          {(product.synced ?? product.variants) === 1 ? "" : "s"}
        </p>
      ) : null}
    </Link>
  );
}
