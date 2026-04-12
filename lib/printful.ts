import "server-only";

import type {
  PrintfulListRow,
  PrintfulSyncProductDetail,
  PrintfulSyncVariant,
} from "@/lib/printful-types";

export type {
  PrintfulListRow,
  PrintfulSyncProductDetail,
  PrintfulSyncVariant,
} from "@/lib/printful-types";

const PRINTFUL_API = "https://api.printful.com";

function getToken(): string {
  const key = process.env.PRINTFUL_API_KEY;
  if (!key) throw new Error("PRINTFUL_API_KEY is not set");
  return key;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

/** List sync products (summary rows). */
export async function listSyncProducts(): Promise<PrintfulListRow[]> {
  const res = await fetch(`${PRINTFUL_API}/sync/products`, {
    headers: authHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`Printful list failed: ${res.status}`);
  }
  const body = (await res.json()) as { result?: PrintfulListRow[] };
  return body.result ?? [];
}

/** Full sync product with variants. */
export async function getSyncProduct(
  syncProductId: number,
): Promise<PrintfulSyncProductDetail> {
  const res = await fetch(`${PRINTFUL_API}/sync/products/${syncProductId}`, {
    headers: authHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`Printful product failed: ${res.status}`);
  }
  const body = (await res.json()) as {
    result?: {
      sync_product: Omit<PrintfulSyncProductDetail, "sync_variants">;
      sync_variants: PrintfulSyncVariant[];
    };
  };
  const r = body.result;
  if (!r?.sync_product) throw new Error("Printful product payload missing");
  return {
    ...r.sync_product,
    sync_variants: r.sync_variants ?? [],
  };
}
