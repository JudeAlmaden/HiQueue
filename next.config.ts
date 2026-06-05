import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable response buffering for SSE
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize for faster edge routing
    optimizePackageImports: ['lucide-react', '@radix-ui/react-tabs'],
  },
  // Optimize production builds
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
