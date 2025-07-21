// 文件路径: server/routes/search.js (排序逻辑最终修复版)
const express = require('express');
const router = express.Router();
const { compareTwoStrings } = require('string-similarity');
const { searchBilibili } = require('../scrapers/bilibiliScraper');
const { searchYouTube } = require('../scrapers/youtubeScraper');
// 如果您添加了其他平台，也在这里引入
// const { searchYouTube } = require('../scrapers/youtubeScraper');

router.get('/', async (req, res) => {
    const { keyword, source = 'all' } = req.query;
    if (!keyword) {
        return res.status(400).json({ message: '需要提供搜索关键词' });
    }

    try {
        // --- 1. 并发搜索 ---
        const searchPromises = [];

        // 根据 source 参数决定调用哪个搜索函数
        if (source === 'all' || source === 'bilibili') {
            searchPromises.push(searchBilibili(keyword));
        }
        if (source === 'all' || source === 'youtube') {
            searchPromises.push(searchYouTube(keyword));
        }
        const allResults = await Promise.all(searchPromises);
        let combinedResults = [].concat(...allResults);

        // --- 2. 去重 ---
        const uniqueResults = combinedResults.reduce((acc, current) => {
            const isDuplicate = acc.some(item => compareTwoStrings(item.title, current.title) > 0.8);
            if (!isDuplicate) {
                acc.push(current);
            }
            return acc;
        }, []);

        // --- 3. 智能排序 ---
        uniqueResults.sort((a, b) => {
            const platformA = a.platform === 'Bilibili' ? 100000000 : 0;
            const platformB = b.platform === 'Bilibili' ? 100000000 : 0;

            // --- 核心修复：直接将 views 视为数字处理 ---
            const viewsA = Number(a.views) || 0;
            const viewsB = Number(b.views) || 0;

            return (platformB + viewsB) - (platformA + viewsA);
        });

        res.json(uniqueResults);
    } catch (error) {
        console.error('聚合搜索失败:', error);
        res.status(500).json({ message: '搜索时发生服务器错误' });
    }
});

module.exports = router;