#!/usr/bin/env node
/**
 * Sync commerce secrets from .env.local to the active Convex deployment.
 * Skips empty values so placeholders are not pushed.
 */
import { spawnSync } from "node:child_process";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

const KEYS = [
  "PRINTFUL_API_KEY",
  "PRINTFUL_WEBHOOK_SECRET",
  "POLAR_WEBHOOK_SECRET",
];

let synced = 0;
for (const key of KEYS) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.warn(`skip ${key} (empty)`);
    continue;
  }
  const r = spawnSync("npx", ["convex", "env", "set", key, value], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  synced += 1;
}

if (synced === 0) {
  console.error(
    "No Convex env vars synced. Fill PRINTFUL_API_KEY, POLAR_WEBHOOK_SECRET (and optionally PRINTFUL_WEBHOOK_SECRET) in .env.local, then re-run.",
  );
  process.exit(1);
}

try {
  requireEnv("NEXT_PUBLIC_CONVEX_SITE_URL");
} catch {
  console.warn(
    "Tip: set NEXT_PUBLIC_CONVEX_SITE_URL in .env.local (from Convex dashboard HTTP URL).",
  );
}

console.log(`Synced ${synced} variable(s) to Convex.`);
