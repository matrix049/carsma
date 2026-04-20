import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Bundle analyzer (disabled in production)
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['framer-motion'],
  },
  
  // Output configuration for Railway
  output: 'standalone',
  
  // Disable source maps in production for smaller bundle
  productionBrowserSourceMaps: false,
};

export default nextConfig;
