#!/usr/bin/env node
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();
const base = requireEnv("NEXT_PUBLIC_CONVEX_SITE_URL").replace(/\/$/, "");

console.log("Register these webhook endpoints:\n");
console.log("Printful:", `${base}/webhooks/printful`);
console.log("  events: package_shipped, order_failed\n");
console.log("Polar:", `${base}/webhooks/polar`);
console.log("  events: order.paid\n");
console.log(
  "When API keys are set in .env.local, run: npm run e2e:register-webhooks",
);
