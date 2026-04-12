import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* If you see a multi-lockfile Turbopack root warning, set turbopack.root to this package directory. */
  async redirects() {
    return [
      // Add 301s here after auditing the live WordPress URL structure (see MVP plan Unit 6).
      // Example:
      // { source: "/old-path", destination: "/shows/music-snobs", permanent: true },
    ];
  },
};

export default nextConfig;
