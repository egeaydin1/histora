import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Specify the root directory for output file tracing to silence multiple lockfiles warning
  outputFileTracingRoot: join(__dirname, '../'),
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