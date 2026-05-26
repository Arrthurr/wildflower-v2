#!/usr/bin/env node
/**
 * Set PRINTFUL_API_KEY in .env.local and sync to Convex.
 *
 * Usage (do not commit the key):
 *   PRINTFUL_API_KEY=your_token node scripts/set-printful-api-key.mjs
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const key = process.env.PRINTFUL_API_KEY?.trim();
if (!key) {
  console.error(
    "Missing PRINTFUL_API_KEY. Get it from Printful Dashboard → Settings → API, then run:\n" +
      "  PRINTFUL_API_KEY=your_token node scripts/set-printful-api-key.mjs",
  );
  process.exit(1);
}

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("No .env.local found. Copy from .env.example first.");
  process.exit(1);
}

let text = fs.readFileSync(envPath, "utf8");
if (/^PRINTFUL_API_KEY=/m.test(text)) {
  text = text.replace(/^PRINTFUL_API_KEY=.*$/m, `PRINTFUL_API_KEY=${key}`);
} else {
  text += `\nPRINTFUL_API_KEY=${key}\n`;
}
fs.writeFileSync(envPath, text);
console.log("Updated PRINTFUL_API_KEY in .env.local");

const sync = spawnSync("node", ["scripts/sync-convex-env.mjs"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (sync.status !== 0) process.exit(sync.status ?? 1);

console.log("Done. Next: npm run e2e:register-webhooks && npm run e2e:pipeline");
