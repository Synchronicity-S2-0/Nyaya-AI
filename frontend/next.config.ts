import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: [
    "better-auth",
    "@better-auth/prisma-adapter",
    "@better-auth/kysely-adapter",
    "kysely",
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;
