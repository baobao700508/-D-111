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
    // 移除不推荐使用的配置
  },
  // 更新到新的配置位置
  serverExternalPackages: ['prisma', '@prisma/client'],
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
