import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.guessthegame\\.net" }],
        destination: "https://guessthegame.net/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          { type: "host", value: "guessthegame\\.net" },
          { type: "header", key: "x-forwarded-proto", value: "http" },
        ],
        destination: "https://guessthegame.net/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();

