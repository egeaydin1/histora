import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel optimizations
  compress: true,
  poweredByHeader: false,
  
  // API rewrites for backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`
      }
    ]
  },
  
  // Image optimization
  images: {
    unoptimized: true
  },
  
  // ESLint configuration for production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration for production builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;