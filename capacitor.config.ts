import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myvideohub.app',
  appName: 'My Video Hub',
  "webDir": "www",
  "server": {
    "url": "https://my-video-hub-pearl.vercel.app", // <--- 确保这里是您的 Vercel 网址
    "cleartext": true
  }
};

export default config;
