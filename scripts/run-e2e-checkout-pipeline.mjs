#!/usr/bin/env node
/**
 * Simulate Polar paid → Printful fulfillment → package_shipped without hosted checkout.
 * Requires PRINTFUL_API_KEY on Convex (npm run e2e:sync-convex).
 */
import { spawnSync } from "node:child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";
import { getE2eLineItem } from "./lib/printful-e2e-line-item.mjs";

loadEnvLocal();

function runConvex(functionName, args = "{}") {
  const r = spawnSync("npx", ["convex", "run", functionName, args], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    console.error(r.stdout || r.stderr);
    process.exit(r.status ?? 1);
  }
  return JSON.parse((r.stdout || "").trim());
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatFulfillmentError(status) {
  if (!status?.lastFulfillmentError) {
    return "Check Convex logs for fulfillment/submitToPrintful.";
  }
  try {
    const parsed = JSON.parse(status.lastFulfillmentError);
    return parsed.error?.message ?? parsed.result ?? status.lastFulfillmentError;
  } catch {
    return status.lastFulfillmentError;
  }
}

async function main() {
  const lineItem = await getE2eLineItem();
  console.log(
    `Using Printful sync variant ${lineItem.printfulVariantId} (${lineItem.name})`,
  );

  const { printfulVariantId, printfulProductId, name, unitPriceCents } = lineItem;
  const paid = await runConvex(
    "e2eSeed:simulatePolarPaid",
    JSON.stringify({ printfulVariantId, printfulProductId, name, unitPriceCents }),
  );
  if (!paid.orderId) {
    console.log("Polar paid simulation skipped (duplicate?):", paid);
    process.exit(0);
  }

  console.log("Created order (paid):", paid.orderId);

  for (let i = 0; i < 12; i++) {
    await sleep(2000);
    const status = await runConvex(
      "e2eSeed:getOrderStatus",
      JSON.stringify({ orderId: paid.orderId }),
    );
    console.log(`  [${i + 1}] status=${status?.status} printful=${status?.printfulOrderId ?? "—"}`);
    if (status?.status === "fulfilling" && status.printfulOrderId) {
      const test = spawnSync(
        "node",
        [
          "scripts/test-printful-webhook.mjs",
          "--order-id",
          paid.orderId,
          "--printful-id",
          String(status.printfulOrderId),
        ],
        { stdio: "inherit", shell: process.platform === "win32" },
      );
      if (test.status !== 0) process.exit(test.status ?? 1);
      const final = await runConvex(
        "e2eSeed:getOrderStatus",
        JSON.stringify({ orderId: paid.orderId }),
      );
      console.log("Final status:", final);
      if (final?.status !== "shipped") process.exit(1);
      console.log("Pipeline passed: paid → fulfilling → shipped");
      console.log("View at http://localhost:3000/account/orders (signed in as seeded user)");
      return;
    }
    if (status?.status === "failed") {
      console.error("Fulfillment failed:", formatFulfillmentError(status));
      console.error(
        "If the message mentions the API key, run: npm run e2e:sync-convex",
      );
      process.exit(1);
    }
  }

  console.error(
    "Timed out waiting for fulfilling. Run npm run e2e:sync-convex and check Convex logs.",
  );
  process.exit(1);
}

main();
