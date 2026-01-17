import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://phongkhamdaihocypnt.edu.vn/nhansu/api/:path*',
      },
    ];
  },
};

export default nextConfig;
