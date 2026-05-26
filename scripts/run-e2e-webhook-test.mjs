#!/usr/bin/env node
/**
 * Seed a fulfilling order, fire package_shipped webhook, verify status=shipped.
 */
import { spawnSync } from "node:child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";
import { getE2eLineItem } from "./lib/printful-e2e-line-item.mjs";

loadEnvLocal();

function runConvex(args) {
  const r = spawnSync("npx", ["convex", "run", ...args], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    console.error(r.stdout || r.stderr);
    process.exit(r.status ?? 1);
  }
  return (r.stdout || "").trim();
}

async function main() {
  const lineItem = await getE2eLineItem();
  const { printfulVariantId, printfulProductId, name, unitPriceCents } = lineItem;
  const seedJson = runConvex([
    "e2eSeed:seedFulfillingOrder",
    JSON.stringify({ printfulVariantId, printfulProductId, name, unitPriceCents }),
  ]);
  const seed = JSON.parse(seedJson);
  console.log("Seeded order:", seed.orderId);

  const test = spawnSync(
    "node",
    [
      "scripts/test-printful-webhook.mjs",
      "--order-id",
      seed.orderId,
      "--printful-id",
      String(seed.printfulOrderId),
    ],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  if (test.status !== 0) process.exit(test.status ?? 1);

  const statusJson = runConvex([
    "e2eSeed:getOrderStatus",
    JSON.stringify({ orderId: seed.orderId }),
  ]);
  const status = JSON.parse(statusJson);
  console.log("Order status after webhook:", status);

  if (status?.status !== "shipped") {
    console.error("Expected status shipped, got", status?.status);
    process.exit(1);
  }

  console.log("E2E webhook test passed.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
