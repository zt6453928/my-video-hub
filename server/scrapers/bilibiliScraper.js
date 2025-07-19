// 文件路径: server/scrapers/bilibiliScraper.js (纯API最终修复版)
const axios = require('axios');

// --- 函数：获取并设置 B 站的会话 Cookie (保持不变) ---
let sessionCookie = null;
async function getBilibiliCookie() {
    try {
        if (sessionCookie) return sessionCookie;
        console.log('[Bilibili Scraper] 正在获取 B 站会话 Cookie...');
        const response = await axios.get('https://www.bilibili.com', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            sessionCookie = cookies.join('; ');
            console.log('[Bilibili Scraper] 成功获取并设置 Cookie。');
            return sessionCookie;
        }
        return '';
    } catch (error) {
        console.error('[Bilibili Scraper] 获取 Cookie 失败:', error.message);
        return '';
    }
}

// --- 函数一：用于全网搜索 (保持不变) ---
async function searchBilibili(keyword) {
    try {
        const cookie = await getBilibiliCookie();
        const apiUrl = `https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=${encodeURIComponent(keyword)}`;
        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://www.bilibili.com/',
                'Cookie': cookie,
            }
        });

        if (data.code !== 0 || !data.data.result) {
            throw new Error(data.message || `Bilibili API返回错误码: ${data.code}`);
        }

        return data.data.result.map(video => {
            let thumbnailUrl = video.pic;
            if (thumbnailUrl && thumbnailUrl.startsWith('//')) {
                thumbnailUrl = 'https:' + thumbnailUrl;
            }
            return {
                title: video.title.replace(/<em class="keyword">|<\/em>/g, ''),
                url: video.arcurl.split('?')[0], // 存储干净的永久链接
                thumbnailUrl: thumbnailUrl,
                author: video.author,
                views: video.play,
                duration: video.duration,
                platform: 'Bilibili'
            };
        });
    } catch (error) {
        console.error('Bilibili 搜索失败:', error.message);
        return [];
    }
}

// --- 核心修复：此函数现在刮取并返回完整的视频对象，包含临时的音视频链接 ---
async function getBilibiliPlayInfo(pageUrl) {
    try {
        let targetUrl = pageUrl;
        if (targetUrl.includes('b23.tv')) {
            const shortLinkResponse = await axios.get(targetUrl, { maxRedirects: 5 });
            targetUrl = shortLinkResponse.request.res.responseUrl || targetUrl;
        }

        const pageResponse = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.bilibili.com/'
            }
        });
        const html = pageResponse.data;
        const $ = cheerio.load(html);

        const title = $('h1.video-title').attr('title') || $('meta[property="og:title"]').attr('content') || 'Bilibili Video';
        let thumbnailUrl = $('meta[property="og:image"]').attr('content');
        if (thumbnailUrl && thumbnailUrl.startsWith('//')) {
            thumbnailUrl = 'https:' + thumbnailUrl;
        }

        let playinfo = null;
        const match = html.match(/window\.__playinfo__=({.+?});/);
        if (match && match[1]) {
            playinfo = JSON.parse(match[1]);
        }

        if (!playinfo || !playinfo.data || !playinfo.data.dash) {
            throw new Error("在页面中未找到有效的播放信息");
        }

        const videoStreamUrl = playinfo.data.dash.video[0].baseUrl;
        const audioStreamUrl = playinfo.data.dash.audio[0].baseUrl;

        return {
            title,
            originalPageUrl: targetUrl.split('?')[0],
            thumbnailUrl: thumbnailUrl.split('@')[0],
            url: videoStreamUrl, // 包含临时视频链接
            audioUrl: audioStreamUrl, // 包含临时音频链接
            platform: "Bilibili",
        };

    } catch (error) {
        console.error(`从 ${pageUrl} 获取播放信息失败:`, error.message);
        throw error; // 将错误抛出，让上层处理
    }
}

// --- 导出两个独立的函数 ---
module.exports = { searchBilibili, getBilibiliPlayInfo };