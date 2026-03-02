import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nextConfig = {
  serverExternalPackages: ["mongoose", "mongodb", "bcryptjs"],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
    // Tree-shake lucide-react: only bundle icons that are actually imported
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
} satisfies NextConfig;

export default nextConfig;
