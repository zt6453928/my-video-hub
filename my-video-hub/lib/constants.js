// 文件路径: my-video-hub/lib/constants.js

// 默认分类
export const DEFAULT_CATEGORY = '未分类';

// 本地存储的 Key
export const STORAGE_KEY_VIDEOS = 'my-video-hub-videos';
export const STORAGE_KEY_PW_HASH = 'private_zone_hash';
export const STORAGE_KEY_CATEGORIES = 'my-video-hub-categories';

// 代理缓存相关配置
export const CACHE_TTL = 24 * 60 * 60 * 1000; // 24小时

// --- 核心修复：更换为生成 PNG 格式的占位图服务 ---
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400.png?text=No+Cover';
export const PLACEHOLDER_IMAGE_ERROR = 'https://via.placeholder.com/600x400.png?text=Error';

// 自动锁定时间 (毫秒)
export const AUTO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 分钟