// 文件路径: next.config.mjs (通配符域名最终版)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // 保留本地占位图方案
      },
      // --- 核心修复：使用通配符授权所有 Bilibili 图片域名 ---
      {
        protocol: 'https',
        hostname: '**.hdslb.com', // 匹配 i0.hdslb.com, i1.hdslb.com, i2.hdslb.com 等
      },
      {
        protocol: 'https',
        hostname: '**.biliimg.com', // 匹配 archive.biliimg.com 等
      },
    ],
  },
};

export default nextConfig;