import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  transpilePackages: ["@coral-xyz/anchor", "@solana/wallet-adapter-base"],
  // Empty turbopack config to satisfy Next.js 16
  turbopack: {},
};

export default nextConfig;
