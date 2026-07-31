import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  allowedDevOrigins: ["192.168.1.146", "localhost:3000"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // Itaas mula sa default na 1MB patungong 5MB
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
