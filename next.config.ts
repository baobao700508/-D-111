import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '**',
      },
    ],
  },
  // 确保环境变量更新后重新加载
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  // 新的位置：将serverComponentsExternalPackages移到这里
  serverExternalPackages: [],
  // 输出独立构建版本
  output: 'standalone',
  // 输出更详细的日志
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
