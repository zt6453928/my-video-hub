// 文件路径: server/scrapers/youtubeScraper.js (修改后)
const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function searchYouTube(keyword) {
    if (!YOUTUBE_API_KEY) {
        console.warn('[YouTube Scraper] 未提供 YOUTUBE_API_KEY，跳过 YouTube 搜索。');
        return [];
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=20`;

        const { data } = await axios.get(apiUrl);

        if (!data.items) {
            return [];
        }

        return data.items.map(item => ({
            title: item.snippet.title,
            // --- 核心修改：返回一个标准的 YouTube 观看链接 ---
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnailUrl: item.snippet.thumbnails.high.url,
            author: item.snippet.channelTitle,
            views: 0,
            duration: '',
            platform: 'YouTube'
        }));

    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            console.error('YouTube API 错误:', error.response.data.error.message);
        } else {
            console.error('YouTube 搜索失败:', error.message);
        }
        return [];
    }
}

module.exports = { searchYouTube };