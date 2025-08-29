import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@headlessui/react']
  },
  // Railway deployment optimizations
  compress: true,
  poweredByHeader: false,
  
  // Environment variables for build time
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // API rewrites if needed
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`
      }
    ]
  },
  
  // Image optimization for Railway
  images: {
    unoptimized: true
  }
};

export default nextConfig;