#!/usr/bin/env node
import { Polar } from "@polar-sh/sdk";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();
const token = requireEnv("POLAR_ACCESS_TOKEN");
const server = process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production";
const polar = new Polar({ accessToken: token, server });

let count = 0;
for await (const page of await polar.products.list({ limit: 20 })) {
  const items = page.result?.items ?? page.items ?? [];
  for (const p of items) {
    console.log(`${p.name ?? "product"}\t${p.id}`);
    count += 1;
  }
}
if (count === 0) console.log("No products found.");
else console.log(`\nSet POLAR_MERCH_PRODUCT_ID in .env.local to one of the IDs above.`);
