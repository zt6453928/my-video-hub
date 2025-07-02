<!-- 
    这是您 README 文件的最终版本。
    请将以下所有内容复制并粘贴到您项目根目录下的 README.md 文件中。
    然后，根据提示替换掉占位符，例如 [Your-GitHub-Username]。
-->

<div align="center">
  <!-- 建议：您可以将自己的 icon.png 上传到仓库的 resources 文件夹，然后在 GitHub 上打开这个图片文件，复制其地址，并替换掉下面的 src 链接。 -->
  <img src="https://i.ibb.co/tP8NRpCc/icon.png" alt="My Video Hub Logo" width="120">
  
  # My Video Hub
  
  A modern, multi-source, personal video collection center.
  
  <!-- 请将下面的 [Your-GitHub-Username] 替换成您的 GitHub 用户名。 -->
  <p>
    <a href="https://github.com/zt6453928/my-video-hub/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/zt6453928/my-video-hub?style=for-the-badge" alt="License">
    </a>
    <img src="https://img.shields.io/github/stars/zt6453928/my-video-hub?style=for-the-badge&logo=github" alt="GitHub Stars">
    <img src="https://img.shields.io/github/forks/zt6453928/my-video-hub?style=for-the-badge&logo=github" alt="GitHub Forks">
  </p>
</div>

<!-- 
    中文注释：
    上面的部分是项目的标题和徽章。
-->

---

**English** | [中文](./README_zh.md) <!-- 这是一个示例，如果您想提供完整的中文版 README，可以创建一个新文件 -->

A modern, multi-source, personal video collection center. It allows users to add, manage, and play videos from various websites, with all data stored locally on the user's device.

<!-- 
    中文注释：
    这里是项目的简短英文介绍。
-->

## 📸 Screenshots 

<p align="center">  <img src="https://i.postimg.cc/3JG1Jpzh/Wechat-IMG414.png" alt="App Screenshot" width="300"/></p>

<!-- 
    中文注释：
    截图是 README 中最重要的部分之一！
    - 请将上面两个 `<img>` 标签的 src 链接替换为您自己的应用截图地址。
-->

## ✨ Features 

-   **🔗 Multi-Source Support**: Built-in support for scraping video metadata from various sites like Bilibili, with a robust generic scraper for others.
    <!-- 中文注释：支持多源 - 已内置对 Bilibili 等网站的抓取支持，并包含一个强大的通用抓取器。 -->
-   **🤖 Automatic Metadata**: Just paste a link, and the app automatically fetches the video's title and cover image.
    <!-- 中文注释：自动元数据 - 只需粘贴链接，应用会自动抓取视频的标题和封面。 -->
-   **🏠 Local-First Storage**: All data is securely stored on the user's own device using `localStorage`, ensuring privacy and no need for a backend database.
    <!-- 中文注释：本地优先存储 - 所有数据都安全地存储在用户自己的设备上，保护隐私。 -->
-   **📱 Responsive Design**: Provides a first-class user experience on both desktop and mobile devices, featuring a Floating Action Button on mobile.
    <!-- 中文注释：响应式设计 - 在桌面和移动设备上都有媲美原生 App 的一流体验。 -->
-   **🎨 Classification & Search**: Users can create their own categories and search for videos by title or tags.
    <!-- 中文注释：分类与搜索 - 用户可以创建自己的分类，并按标题或标签搜索视频。 -->
-   **▶️ Advanced Player**: Supports separated video/audio streams (like Bilibili) and HLS (.m3u8) streams.
    <!-- 中文注释：高级播放器 - 支持音视频分离的流（如 Bilibili）和 HLS 流。 -->
-   **📦 App Ready**: Configured with Capacitor to be easily packaged into native Android or iOS apps.
    <!-- 中文注释：可打包 - 已通过 Capacitor 配置，可以轻松打包成原生安卓或 iOS 应用。 -->

## 🛠️ Tech Stack 

-   **Framework**: [Next.js](https://nextjs.org/) – The React Framework for the Web.
-   **Styling**: [Bootstrap 5](https://getbootstrap.com/) – For rapid and responsive UI development.
-   **Web Scraping**: [Cheerio](https://cheerio.js.org/) – For parsing HTML and extracting data on the server.
-   **App Packaging**: [Capacitor](https://capacitorjs.com/) – For turning the web app into a native mobile app.

<!-- 
    中文注释：
    这里列出了项目使用的主要技术。
-->

## 🚀 Getting Started 

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

<!-- 
    中文注释：
    这部分是指导其他开发者如何在他们自己的电脑上运行您的项目。
-->

### Prerequisites 

Make sure you have Node.js (version 18.x or higher) installed on your system.

<!-- 
    中文注释：
    运行项目需要的基本环境。
-->

### Installation 

1.  **Clone the repository** 
    ```bash
    git clone [https://github.com/](https://github.com/)[Your-GitHub-Username]/my-video-hub.git
    cd my-video-hub
    ```
    <!-- 中文注释：请将 [Your-GitHub-Username] 替换成您的 GitHub 用户名。 -->

2.  **Install dependencies** 
    ```bash
    npm install
    ```

3.  **Run the development server** 
    ```bash
    npm run dev
    ```

4.  **Open the app** 
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Building the Android App 

1.  **Install Capacitor Android library** 
    ```bash
    npm install @capacitor/android
    ```

2.  **Add the Android platform** 
    ```bash
    npx cap add android
    ```

3.  **Sync your project** 
    ```bash
    npx cap sync
    ```

4.  **Open in Android Studio** 
    ```bash
    npx cap open android
    ```
    From there, you can use Android Studio's standard tools to build the APK.

<!-- 
    中文注释：
    这里简要说明了如何打包成安卓应用。
-->

## 🤝 Contributing 

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/[Your-GitHub-Username]/my-video-hub/issues).

<!-- 
    中文注释：
    这是一个标准的开源项目部分，欢迎其他人参与贡献。
-->

## 中国用户

> My Video Hub 目前未做应用自动更新，需要自己留意此项目的新版本发布（如果有 GitHub 账号的，可以 watch 或 star）。
这里有两篇使用文档，对 Noi 的理念和插件系统做了详细介绍，推荐新手仔细阅读。

如果 My Video Hub 应用对你有帮助可以分享给更多人，或者微信扫码打赏。
<img height="240" src="https://i.postimg.cc/zfRjch53/Wechat-IMG415.png">

<!-- 
    中文注释：
    声明您的项目使用的开源许可证。
-->
