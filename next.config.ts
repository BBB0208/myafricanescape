import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // photos and logos come straight from Sanity's image CDN, sized per
    // srcset entry and served as WebP/AVIF — no second trip through Next
    loader: "custom",
    loaderFile: "./sanity/lib/imageLoader.ts",
  },
  // pages renamed or folded together; keep the old URLs working
  async redirects() {
    return [
      { source: "/financial", destination: "/invest", permanent: false },
      // /events was the event calendar's original address; the calendar now
      // lives on Lifestyle, while Episodes is the trailer alone
      { source: "/events", destination: "/lifestyle#calendar", permanent: false },
    ];
  },
};

export default nextConfig;
