import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/product-card";
import { BRAND } from "@/lib/brand";
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
    <>
      <div className="border-b border-outline-variant bg-surface-container py-margin-md">
        <PageContainer>
          <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">
            {BRAND.merchSectionEyebrow}
          </span>
          <h1 className="text-headline-lg-mobile text-primary sm:text-headline-lg">
            {BRAND.merchSectionTitle}
          </h1>
          <p className="mt-4 max-w-2xl font-editorial text-editorial-body text-on-surface-variant">
            T-shirts and more, fulfilled by Printful. Prices refresh every few minutes.
          </p>
        </PageContainer>
      </div>
      <PageContainer className="py-margin-md">
        {error ? (
          <p className="mt-8 rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
            {error} Set{" "}
            <code className="rounded bg-muted px-1">PRINTFUL_API_KEY</code> for local
            development.
          </p>
        ) : null}

        {!error && products.length === 0 ? (
          <p className="mt-8 text-sm text-on-surface-variant">
            No sync products yet. Add products in Printful and sync them to this store.
          </p>
        ) : null}

        {!error && products.length > 0 ? (
          <ul className="mt-10 grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        ) : null}
      </PageContainer>
      <SiteFooter />
    </>
  );
}
