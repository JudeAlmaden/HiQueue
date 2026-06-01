import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable response buffering for SSE
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
