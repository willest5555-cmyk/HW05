import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/interactive/:path*',
        destination: `${process.env.API_URL || 'https://hw05-backend.onrender.com'}/api/interactive/:path*`,
      },
    ];
  },
};

export default nextConfig;
