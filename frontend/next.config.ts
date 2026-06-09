import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/interactive/:path*',
        destination: 'http://127.0.0.1:8000/api/interactive/:path*',
      },
    ];
  },
};

export default nextConfig;
