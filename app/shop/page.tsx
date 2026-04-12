import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { listSyncProducts } from "@/lib/printful";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop",
  description: "Wildflower Media merch — printed on demand.",
};

export default async function ShopPage() {
  let products: Awaited<ReturnType<typeof listSyncProducts>> = [];
  let error: string | null = null;
  try {
    products = await listSyncProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load products.";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Shop</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        T-shirts and more, fulfilled by Printful. Prices refresh every few
        minutes.
      </p>

      {error ? (
        <p className="mt-8 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          {error} Set <code className="rounded bg-muted px-1">PRINTFUL_API_KEY</code>{" "}
          for local development.
        </p>
      ) : null}

      {!error && products.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No sync products yet. Add products in Printful and sync them to this
          store.
        </p>
      ) : null}

      {!error && products.length > 0 ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
