// 文件路径: next.config.mjs (修改后)

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
        hostname: 'via.placeholder.com',
      },
      // Bilibili 的域名
      {
        protocol: 'https',
        hostname: '**.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: '**.biliimg.com',
      },
      // --- 新增：YouTube 的图片域名 ---
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
};

export default nextConfig;