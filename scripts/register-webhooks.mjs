#!/usr/bin/env node
/**
 * Register Printful + Polar webhooks pointing at this Convex deployment.
 */
import { Polar } from "@polar-sh/sdk";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

const siteUrl = requireEnv("NEXT_PUBLIC_CONVEX_SITE_URL").replace(/\/$/, "");
const printfulUrl = `${siteUrl}/webhooks/printful`;
const polarUrl = `${siteUrl}/webhooks/polar`;

async function registerPrintful() {
  const key = requireEnv("PRINTFUL_API_KEY");
  const secret = process.env.PRINTFUL_WEBHOOK_SECRET?.trim();
  const res = await fetch("https://api.printful.com/webhooks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: printfulUrl,
      types: ["package_shipped", "order_failed"],
      ...(secret ? { secret } : {}),
    }),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Printful webhook setup failed (${res.status}): ${body}`);
  }
  console.log("Printful webhook registered:", printfulUrl);
  console.log(body);
}

async function registerPolar() {
  const token = requireEnv("POLAR_ACCESS_TOKEN");
  const server = process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production";
  const polar = new Polar({ accessToken: token, server });

  // Organization access tokens are already scoped to one org — do not pass organizationId.
  const endpoint = await polar.webhooks.createWebhookEndpoint({
    url: polarUrl,
    format: "raw",
    events: ["order.paid"],
  });

  console.log("Polar webhook registered:", polarUrl);
  if (endpoint.secret) {
    console.log(
      "Set POLAR_WEBHOOK_SECRET in .env.local to the secret above, then run: npm run e2e:sync-convex",
    );
  }
}

async function main() {
  await registerPrintful();
  await registerPolar();
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
