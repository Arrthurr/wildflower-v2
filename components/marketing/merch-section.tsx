import Link from "next/link";
import type { PrintfulListRow } from "@/lib/printful-types";
import { ProductCard } from "@/components/product-card";
import { PageContainer } from "@/components/layout/page-container";
import { BRAND } from "@/lib/brand";

export function MerchSection({
  products,
  error,
}: {
  products: PrintfulListRow[];
  error: string | null;
}) {
  return (
    <section className="bg-surface-container py-margin-lg">
      <PageContainer>
        <div className="mb-16 flex flex-col items-end justify-between gap-gutter md:flex-row">
          <div className="max-w-xl">
            <span className="mb-4 block text-label-caps tracking-widest text-tms-orange">
              {BRAND.merchSectionEyebrow}
            </span>
            <h2 className="text-headline-lg-mobile text-primary sm:text-headline-lg">
              {BRAND.merchSectionTitle}
            </h2>
          </div>
          <Link
            href="/shop"
            className="mb-2 border-b-2 border-outline-variant pb-1 text-ui-medium text-primary transition-all hover:border-tms-orange"
          >
            Shop all merchandise
          </Link>
        </div>

        {error ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
            {error}
          </p>
        ) : null}

        {!error && products.length === 0 ? (
          <p className="text-on-surface-variant">Merch coming soon.</p>
        ) : null}

        {products.length > 0 ? (
          <ul className="grid grid-cols-1 gap-gutter rounded-xl border border-outline-variant p-gutter transition-colors hover:border-tms-orange/40 md:grid-cols-3">
            {products.slice(0, 3).map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        ) : null}
      </PageContainer>
    </section>
  );
}
