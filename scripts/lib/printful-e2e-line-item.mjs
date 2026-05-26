import { loadEnvLocal, requireEnv } from "./load-env.mjs";

/**
 * Line item for E2E tests using a real sync variant from the connected Printful store.
 * Override with PRINTFUL_E2E_SYNC_VARIANT_ID (+ optional PRINTFUL_E2E_SYNC_PRODUCT_ID).
 */
export async function getE2eLineItem() {
  loadEnvLocal();

  const variantOverride = process.env.PRINTFUL_E2E_SYNC_VARIANT_ID?.trim();
  if (variantOverride) {
    const productOverride = process.env.PRINTFUL_E2E_SYNC_PRODUCT_ID?.trim();
    return {
      printfulVariantId: Number(variantOverride),
      printfulProductId: productOverride ? Number(productOverride) : 0,
      name: process.env.PRINTFUL_E2E_LINE_ITEM_NAME?.trim() ?? "E2E test item",
      quantity: 1,
      unitPriceCents: 2500,
    };
  }

  const key = requireEnv("PRINTFUL_API_KEY");
  const listRes = await fetch("https://api.printful.com/sync/products?limit=5", {
    headers: { Authorization: `Bearer ${key}` },
  });
  const listBody = await listRes.json();
  if (!listRes.ok) {
    throw new Error(`Printful list failed (${listRes.status}): ${JSON.stringify(listBody)}`);
  }

  const products = listBody.result ?? [];
  if (!products.length) {
    throw new Error(
      "No sync products in Printful store. Add products in Printful or set PRINTFUL_E2E_SYNC_VARIANT_ID in .env.local.",
    );
  }

  for (const product of products) {
    const detailRes = await fetch(`https://api.printful.com/sync/products/${product.id}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    const detailBody = await detailRes.json();
    if (!detailRes.ok) continue;

    const variants = detailBody.result?.sync_variants ?? [];
    const variant = variants.find((v) => v.synced) ?? variants[0];
    if (!variant?.id) continue;

    return {
      printfulVariantId: variant.id,
      printfulProductId: product.id,
      name: variant.name ?? product.name ?? "E2E test item",
      quantity: 1,
      unitPriceCents: 2500,
    };
  }

  throw new Error(
    "No sync variants found. Publish sync products in Printful or set PRINTFUL_E2E_SYNC_VARIANT_ID.",
  );
}
