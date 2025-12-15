import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, path: false };
    
    // Exclude unused knex database drivers
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "better-sqlite3",
      "mysql",
      "mysql2",
      "oracledb",
      "pg-query-stream",
      "sqlite3",
      "tedious"
    );

    // Fix .js imports for TypeScript files
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
      ".jsx": [".jsx", ".tsx"],
    };

    return config;
  },
  transpilePackages: ["@coral-xyz/anchor", "@solana/wallet-adapter-base"],
  // Empty turbopack config to satisfy Next.js 16
  turbopack: {},
  // Required for pg (postgres) to work properly in serverless
  serverExternalPackages: ['pg', 'knex'],
};

export default nextConfig;
