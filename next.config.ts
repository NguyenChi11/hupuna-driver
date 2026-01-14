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
      {
        protocol: "https",
        hostname: "files.hupuna.vn",
        pathname: "/api/files/**",
      },
      {
        protocol: "http",
        hostname: "117.4.242.30",
        port: "8090",
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
