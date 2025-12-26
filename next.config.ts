import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/mega-stream",
        search: "", // Allow all query strings
      },
    ],
  },
};

export default nextConfig;
