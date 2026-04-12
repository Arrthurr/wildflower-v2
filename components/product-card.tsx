import Link from "next/link";
import type { PrintfulListRow } from "@/lib/printful-types";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProductCard({ product }: { product: PrintfulListRow }) {
  return (
    <Link href={`/shop/${product.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:bg-muted/40">
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail_url}
            alt=""
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="aspect-square w-full bg-muted" />
        )}
        <CardHeader>
          <CardTitle className="text-base">{product.name}</CardTitle>
          {product.variants != null ? (
            <CardDescription>
              {product.synced ?? product.variants} variant
              {(product.synced ?? product.variants) === 1 ? "" : "s"}
            </CardDescription>
          ) : null}
        </CardHeader>
      </Card>
    </Link>
  );
}
