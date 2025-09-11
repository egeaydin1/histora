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
  },
  
  // ESLint configuration for production builds
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for production builds
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;