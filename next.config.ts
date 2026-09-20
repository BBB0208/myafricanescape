import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // photos and logos uploaded to Sanity, served as AVIF/WebP
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // pages renamed or folded together; keep the old URLs working
  async redirects() {
    return [
      { source: "/financial", destination: "/invest", permanent: false },
      // Episodes was folded into Lifestyle — see scripts/migrate-episodes.ts
      { source: "/events", destination: "/lifestyle", permanent: false },
      { source: "/episodes", destination: "/lifestyle", permanent: false },
    ];
  },
};

export default nextConfig;
