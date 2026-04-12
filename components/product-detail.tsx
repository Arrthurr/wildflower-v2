"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { PrintfulSyncProductDetail } from "@/lib/printful-types";
import { formatCents, retailPriceToCents } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: PrintfulSyncProductDetail }) {
  const { isSignedIn } = useAuth();
  const addToCart = useMutation(api.cartItems.addToCart);

  const variants = useMemo(
    () =>
      [...product.sync_variants].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [product.sync_variants],
  );

  const [selectedId, setSelectedId] = useState<number | null>(
    variants[0]?.id ?? null,
  );
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const [busy, setBusy] = useState(false);

  const priceCents = selected
    ? retailPriceToCents(selected.retail_price)
    : 0;

  async function onAdd() {
    if (!selected || !isSignedIn) return;
    setBusy(true);
    try {
      await addToCart({
        printfulVariantId: selected.id,
        printfulProductId: product.id,
        quantity: 1,
        unitPriceCents: priceCents,
        variantLabel: selected.name,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="space-y-4">
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail_url}
            alt=""
            className="w-full rounded-lg border border-border bg-muted object-cover"
          />
        ) : (
          <div className="aspect-square w-full rounded-lg bg-muted" />
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          {selected ? (
            <p className="mt-2 text-2xl font-medium">
              {formatCents(priceCents, selected.currency || "USD")}
            </p>
          ) : null}
        </div>

        {variants.length > 1 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Choose a variant</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    selected?.id === v.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!isSignedIn ? (
          <p className="text-sm text-muted-foreground">
            <Link href="/sign-in" className="font-medium text-primary underline">
              Sign in
            </Link>{" "}
            to add items to your cart.
          </p>
        ) : (
          <Button
            type="button"
            size="lg"
            disabled={!selected || busy}
            onClick={() => void onAdd()}
          >
            Add to cart
          </Button>
        )}
      </div>
    </div>
  );
}
