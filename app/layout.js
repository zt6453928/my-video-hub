// 文件路径: app/layout.js (v3.4 - 字体修复版)

// --- 步骤 1: 移除 next/font/google 的导入 ---
// import { Inter } from "next/font/google"; // <--- 删除或注释掉这一行
import "./globals.css";

// --- 步骤 2: 移除 Inter 对象的创建 ---
// const inter = Inter({ subsets: ["latin"] }); // <--- 删除或注释掉这一行

export const metadata = {
  title: "My Video Hub",
  description: "由 Next.js 和 Bootstrap 驱动的个人视频收藏中心",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" data-bs-theme="light">
      <head>
        {/* --- 步骤 3: 新增 Google 字体链接 --- */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />

        {/* Bootstrap 的链接保持不变 */}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>

      {/* --- 步骤 4: 移除 body 上的 className --- */}
      {/* 旧代码: <body className={inter.className}> */}
      <body> {/* <--- 修改后的代码 */}
        <div className="container py-4">
          {children}
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous" async></script>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest" async></script>
      </body>
    </html>
  );
}