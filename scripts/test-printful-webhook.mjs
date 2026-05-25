#!/usr/bin/env node
/**
 * POST a signed package_shipped payload to the Convex Printful webhook.
 * Usage:
 *   node scripts/test-printful-webhook.mjs --order-id <convexOrderId> --printful-id 99
 */
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

function parseArgs() {
  const args = process.argv.slice(2);
  let orderId;
  let printfulId = 99;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--order-id" && args[i + 1]) orderId = args[++i];
    if (args[i] === "--printful-id" && args[i + 1]) printfulId = Number(args[++i]);
  }
  if (!orderId) {
    throw new Error("Usage: --order-id <convex_orders_document_id> [--printful-id N]");
  }
  return { orderId, printfulId };
}

async function hmacSha256Hex(body, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function main() {
  const { orderId, printfulId } = parseArgs();
  const siteUrl = requireEnv("NEXT_PUBLIC_CONVEX_SITE_URL").replace(/\/$/, "");
  const url = `${siteUrl}/webhooks/printful`;

  const shipmentId = Math.floor(Date.now() % 1_000_000_000);
  const payload = {
    type: "package_shipped",
    created: Math.floor(Date.now() / 1000),
    retries: 0,
    store: 1,
    data: {
      order: { id: printfulId, external_id: orderId },
      shipment: {
        id: shipmentId,
        tracking_number: "9400111899223344556677",
        tracking_url: "https://track.example/9400",
      },
    },
  };

  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };
  const secret = process.env.PRINTFUL_WEBHOOK_SECRET?.trim();
  if (secret) {
    headers["X-Printful-Signature"] = await hmacSha256Hex(body, secret);
  }

  const res = await fetch(url, { method: "POST", headers, body });
  const text = await res.text();
  console.log(`POST ${url} -> ${res.status}`);
  if (text) console.log(text);
  if (!res.ok) process.exit(1);
  console.log("OK — check Convex Data: orders status should be shipped.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
