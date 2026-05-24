import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    /* Avoid inferring workspace root from a parent-directory lockfile (e.g. ~/bun.lock). */
    root: projectRoot,
  },
  async redirects() {
    return [
      // Add 301s here after auditing the live WordPress URL structure (see MVP plan Unit 6).
      // Example:
      // { source: "/old-path", destination: "/shows/music-snobs", permanent: true },
    ];
  },
};

export default nextConfig;
