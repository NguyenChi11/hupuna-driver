import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/mega-stream",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mega.nz",
        pathname: "/file/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
    ],
  },
};

export default nextConfig;
