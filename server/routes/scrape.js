// 文件路径: server/routes/scrape.js (新文件)
const express = require('express');
const router = express.Router();
// 引入我们之前创建的、功能强大的刮取器
const { getBilibiliPlayInfo } = require('../scrapers/bilibiliScraper');

// === API 端点: POST /api/scrape (刮取单个视频信息) ===
router.post('/', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ message: '需要提供 URL' });
    }

    try {
        console.log(`[Scrape Route] 收到刮取请求: ${url}`);
        const hostname = new URL(url).hostname;
        let videoData;

        // 目前我们只专注于 Bilibili 的刮取
        if (hostname.includes('bilibili.com') || hostname.includes('b23.tv')) {
            videoData = await getBilibiliPlayInfo(url);
            if (!videoData.url) {
                throw new Error('从B站API获取信息失败');
            }
        } else {
            // TODO: 在这里可以添加对其他平台的支持
            return res.status(400).json({ message: '当前仅支持 Bilibili 链接' });
        }

        res.status(200).json(videoData);

    } catch (error) {
        console.error('[Scrape Route] 刮取失败:', error);
        res.status(500).json({ message: error.message || '刮取视频时发生未知错误' });
    }
});

module.exports = router;