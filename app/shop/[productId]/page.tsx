import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductDetail } from "@/components/product-detail";
import { getSyncProduct } from "@/lib/printful";

export const revalidate = 300;

type Props = { params: Promise<{ productId: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { productId } = await props.params;
  const id = Number.parseInt(productId, 10);
  if (Number.isNaN(id)) return { title: "Product" };
  try {
    const product = await getSyncProduct(id);
    return {
      title: product.name,
      description: "Wildflower Media — print on demand merch.",
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage(props: Props) {
  const { productId } = await props.params;
  const id = Number.parseInt(productId, 10);
  if (Number.isNaN(id)) notFound();

  let product: Awaited<ReturnType<typeof getSyncProduct>>;
  try {
    product = await getSyncProduct(id);
  } catch {
    notFound();
  }

  return (
    <>
      <PageContainer className="py-margin-md">
        <p className="text-sm text-on-surface-variant">
          <Link href="/shop" className="hover:text-tms-orange underline underline-offset-4">
            ← Back to shop
          </Link>
        </p>
        <div className="mt-6 rounded-xl border border-outline-variant bg-surface-container p-6 ring-1 ring-tms-orange/10">
          <ProductDetail product={product} />
        </div>
      </PageContainer>
      <SiteFooter />
    </>
  );
}
