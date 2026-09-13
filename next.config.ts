import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // photos and logos uploaded to Sanity, served as AVIF/WebP
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // pages renamed with the 2026 redesign; keep the old URLs working
  async redirects() {
    return [
      { source: "/financial", destination: "/invest", permanent: false },
      { source: "/events", destination: "/episodes", permanent: false },
    ];
  },
};

export default nextConfig;
