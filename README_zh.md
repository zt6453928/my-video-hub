<!-- 这是您的中文版 README 文件 -->

<div align="center">
  <img src="https://i.ibb.co/tP8NRpCc/icon.png" alt="My Video Hub Logo" width="120">
  
  # My Video Hub 
  
  一个现代化的、支持多源的个人视频收藏中心。
  
  <p>
    <a href="https://github.com/zt6453928/my-video-hub/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/zt6453928/my-video-hub?style=for-the-badge" alt="许可证">
    </a>
    <img src="https://img.shields.io/github/stars/zt6453928/my-video-hub?style=for-the-badge&logo=github" alt="GitHub 点赞数">
    <img src="https://img.shields.io/github/forks/zt6453928/my-video-hub?style=for-the-badge&logo=github" alt="GitHub Forks">
  </p>
</div>

---

[English](./README.md) | **中文**

一个现代化的、支持多源的个人视频收藏中心。它允许用户添加、管理和播放来自不同网站的视频，所有数据都安全地存储在用户自己的设备上。

## 📸 应用截图

<p align="center">
  <img src="https://i.postimg.cc/3JG1Jpzh/Wechat-IMG414.png" alt="应用截图" width="300"/>
</p>

## ✨ 功能特性

-   **🔗 多源支持**: 已内置对 Bilibili、P、X等网站的抓取支持，并包含一个强大的通用抓取器。
-   **🤖 自动元数据**: 只需粘贴链接，应用会自动抓取视频的标题和封面。
-   **🏠 本地优先存储**: 所有数据都安全地存储在用户自己的设备上，通过 `localStorage` 实现，保护隐私，无需后端数据库。
-   **📱 响应式设计**: 在桌面和移动设备上都有媲美原生 App 的一流体验，并在移动端配有浮动操作按钮。
-   **🎨 分类与搜索**: 用户可以创建自己的分类，并按标题或标签搜索视频。
-   **▶️ 高级播放器**: 支持音视频分离的流（如 Bilibili）和 HLS (.m3u8) 流。
-   **📦 可打包为 App**: 已通过 Capacitor 配置，可以轻松打包成原生安卓或 iOS 应用。

## 🛠️ 技术栈

-   **框架**: [Next.js](https://nextjs.org/) – 用于构建全栈 Web 应用的 React 框架。
-   **样式**: [Bootstrap 5](https://getbootstrap.com/) – 用于快速构建响应式用户界面。
-   **网页抓取**: [Cheerio](https://cheerio.js.org/) – 用于在服务器端解析 HTML 并提取数据。
-   **App 打包**: [Capacitor](https://capacitorjs.com/) – 用于将 Web 应用转换为原生移动应用。

## 🚀 快速开始

请遵循以下说明，在您的本地计算机上获取并运行该项目，以进行开发和测试。

### 先决条件

请确保您的系统中已安装 Node.js (建议使用 18.x 或更高版本)。

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone [https://github.com/zt6453928/my-video-hub.git](https://github.com/zt6453928/my-video-hub.git)
    cd my-video-hub
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **运行开发服务器**
    ```bash
    npm run dev
    ```

4.  **打开应用**
    在您的浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 📦 打包安卓应用

1.  **安装 Capacitor 安卓库**
    ```bash
    npm install @capacitor/android
    ```

2.  **添加安卓平台**
    ```bash
    npx cap add android
    ```

3.  **同步项目**
    ```bash
    npx cap sync
    ```

4.  **在 Android Studio 中打开**
    ```bash
    npx cap open android
    ```
    之后，您就可以使用 Android Studio 的标准工具来构建 APK 了。

## 🤝 如何贡献

欢迎各种形式的贡献、问题报告和功能请求！请随时在 [Issues 页面](https://github.com/zt6453928/my-video-hub/issues)查看正在进行的讨论或提交新的问题。

