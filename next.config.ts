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
      // Episodes keeps its own page (the trailer and the event calendar);
      // /events was its original address
      { source: "/events", destination: "/episodes", permanent: false },
    ];
  },
};

export default nextConfig;
