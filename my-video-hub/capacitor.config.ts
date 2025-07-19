import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myvideohub.app',
  appName: 'My Video Hub',
  "webDir": "www",
  "server": {
    "url": "https://mvideo.zeabur.app",
    "cleartext": true
  }
};

export default config;
