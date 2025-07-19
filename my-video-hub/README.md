<div align="center">
  
  <img src="https://i.ibb.co/tP8NRpCc/icon.png" alt="My Video Hub Logo" width="120">
  
  # My Video Hub
  
  A modern, multi-source, personal video collection center.
  
  
  <p>
    <a href="https://github.com/zt6453928/my-video-hub/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/zt6453928/my-video-hub?style=for-the-badge" alt="License">
    </a>
    <img src="https://img.shields.io/github/stars/zt6453928/my-video-hub?style=for-the-badge&logo=github" alt="GitHub Stars">
    <img src="https://img.shields.io/github/forks/zt6453928/my-video-hub?style=for-the-badge&logo=github" alt="GitHub Forks">
  </p>
</div>



---

**English** | [中文](./README_zh.md) 

A modern, multi-source, personal video collection center. It allows users to add, manage, and play videos from various websites, with all data stored locally on the user's device.



## 📸 Screenshots 

<p align="center">  <img src="https://i.postimg.cc/3JG1Jpzh/Wechat-IMG414.png" alt="App Screenshot" width="300"/></p>



## ✨ Features 

-   **🔗 Multi-Source Support**: Built-in support for scraping video metadata from various sites like Bilibili,Pornhub,XVideos,jable with a robust generic scraper for others.
   
-   **🤖 Automatic Metadata**: Just paste a link, and the app automatically fetches the video's title and cover image.
    
-   **🏠 Local-First Storage**: All data is securely stored on the user's own device using `localStorage`, ensuring privacy and no need for a backend database.
    
-   **📱 Responsive Design**: Provides a first-class user experience on both desktop and mobile devices, featuring a Floating Action Button on mobile.
    
-   **🎨 Classification & Search**: Users can create their own categories and search for videos by title or tags.
    
-   **▶️ Advanced Player**: Supports separated video/audio streams (like Bilibili) and HLS (.m3u8) streams.
    
-   **📦 App Ready**: Configured with Capacitor to be easily packaged into native Android or iOS apps.
    

## 🛠️ Tech Stack 

-   **Framework**: [Next.js](https://nextjs.org/) – The React Framework for the Web.
-   **Styling**: [Bootstrap 5](https://getbootstrap.com/) – For rapid and responsive UI development.
-   **Web Scraping**: [Cheerio](https://cheerio.js.org/) – For parsing HTML and extracting data on the server.
-   **App Packaging**: [Capacitor](https://capacitorjs.com/) – For turning the web app into a native mobile app.



## 🚀 Getting Started 

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.



### Prerequisites 

Make sure you have Node.js (version 18.x or higher) installed on your system.



### Installation 

1.  **Clone the repository** 
    ```bash
    git clone [https://github.com/](https://github.com/)zt6453928/my-video-hub.git
    cd my-video-hub
    ```
    

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



## 🤝 Contributing 

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/[Your-GitHub-Username]/my-video-hub/issues).



## 中国用户

> My Video Hub 目前未做应用自动更新，需要自己留意此项目的新版本发布（如果有 GitHub 账号的，可以 watch 或 star）。


如果 My Video Hub 应用对你有帮助可以分享给更多人，或者微信扫码打赏。
<p align="center">  <img src="https://i.postimg.cc/zfRjch53/Wechat-IMG415.png" alt="App Screenshot" width="300"/></p>
