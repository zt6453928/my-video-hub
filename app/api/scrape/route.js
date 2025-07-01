// 文件路径: app/api/scrape/route.js (v4.2 - 最终修复版)

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// --- POST 函数现在是这个文件的唯一内容，且逻辑已简化 ---
export async function POST(request) {
    const { url } = await request.json();
    if (!url) {
        return NextResponse.json({ message: '需要提供 URL' }, { status: 400 });
    }

    try {
        const hostname = new URL(url).hostname;
        let videoData;

        console.log(`[Scrape API] 收到 URL，主机名: ${hostname}`);

        // --- 智能判断，调用不同的抓取函数 ---
        // 提示: 请将 'happy.com' 和 'japan.com' 替换为网站的真实域名
        if (hostname.includes('cn.pornhub.com')) {
            console.log('[调度中心] 决策: 使用 Happy 网站提取策略...');
            videoData = await scrapeHappy(url);
        } else if (hostname.includes('jable.tv')) {
            console.log('[调度中心] 决策: 使用 Japan 网站提取策略...');
            videoData = await scrapeJapan(url);
        } else if (hostname.includes('bilibili.com')) { // --- 新增 B站判断 ---
            console.log('[调度中心] 决策: 使用 Bilibili 提取策略...');
            videoData = await scrapeBilibili(url);
        } else if (hostname.includes('xvideos.com')) {
            console.log('[调度中心] 决策: 使用 Xv 提取策略...');
            videoData = await scrapeXv(url);
        }

        // --- 核心修复 ---
        // 成功后，只返回抓取到的 JSON 数据，不再执行任何文件操作。
        return NextResponse.json(videoData, { status: 200 });

    } catch (error) {
        console.error('[Scrape API] 处理请求失败:', error);
        return NextResponse.json({ message: error.message || '提取视频数据时出错' }, { status: 500 });
    }
}

// --- 抓取函数 1: "Happy" 网站的完整逻辑 ---
async function scrapeHappy(url) {
    console.log(`[抓取器-Happy] 开始抓取: ${url}`);
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });
    if (!response.ok) throw new Error(`请求页面失败，状态码: ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1.title span.inlineFree').text().trim() || $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    const thumbnailUrl = $('img#videoElementPoster').attr('src') || $('meta[property="og:image"]').attr('content');

    let videoUrl = '';
    const scriptContent = $('script:contains("mediaDefinitions")').html();
    if (scriptContent) {
        const flashvarsMatch = scriptContent.match(/var\s+flashvars_\d+\s*=\s*({[\s\S]*?});/);
        if (flashvarsMatch && flashvarsMatch[1]) {
            try {
                const flashvarsJson = JSON.parse(flashvarsMatch[1]);
                const mediaDefinitions = flashvarsJson.mediaDefinitions;
                if (mediaDefinitions && mediaDefinitions.length > 0) {
                    const hlsMedia = mediaDefinitions.find(m => m.format === 'hls' && m.videoUrl);
                    if (hlsMedia) videoUrl = hlsMedia.videoUrl;
                    else {
                        const highestQualityMedia = mediaDefinitions.filter(m => m.videoUrl).pop();
                        if (highestQualityMedia) videoUrl = highestQualityMedia.videoUrl;
                    }
                }
            } catch (e) { console.error("[抓取器-Happy] 解析 flashvars JSON 失败:", e); }
        }
    }

    if (!title || !thumbnailUrl) throw new Error('无法从 Happy 页面提取标题或封面图。');

    return {
        id: `vid_happy_${new Date().getTime()}`,
        url: videoUrl || url,
        originalPageUrl: url,
        title,
        thumbnailUrl,
        platform: "Happy",
        category: "未分类",
        tags: [],
        addedAt: new Date().toISOString(),
    };
}

// --- 抓取函数 2: "Japan" 网站的专属逻辑 (v3.13 - 耐心点击终极版) ---
async function scrapeJapan(url) {
    console.log(`[抓取器-Japan-v3.13] 启动浏览器...`);
    let browser = null;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        let m3u8Url = '';
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const reqUrl = request.url();
            if (reqUrl.includes('.m3u8') && !m3u8Url) {
                console.log(`[抓取器-Japan-v3.13] 成功拦截到 M3U8 请求: ${reqUrl}`);
                m3u8Url = reqUrl;
                request.abort();
            } else {
                request.continue();
            }
        });

        console.log(`[抓取器-Japan-v3.13] 正在导航到: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log(`[抓取器-Japan-v3.13] 页面加载完成。`);

        // --- 核心步骤：模拟一个耐心的用户点击 ---
        try {
            // 使用您提供的元素信息，构造一个绝对精确的选择器
            const playButtonSelector = 'button.plyr__control--overlaid[data-plyr="play"]';

            console.log(`[抓取器-Japan-v3.13] 等待2秒，确保所有覆盖层消失...`);
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log(`[抓取器-Japan-v3.13] 正在查找并点击播放按钮 (选择器: ${playButtonSelector})...`);
            await page.waitForSelector(playButtonSelector, { visible: true, timeout: 10000 });
            await page.click(playButtonSelector);
            console.log(`[抓取器-Japan-v3.13] 播放按钮已成功点击。`);

        } catch (e) {
            console.error(`[抓取器-Japan-v3.13] 点击播放按钮失败: ${e.message}`);
            // 即使点击失败，我们依然尝试等待网络请求，以防万一
        }

        console.log(`[抓取器-Japan-v3.13] 等待播放器发起 M3U8 请求...`);
        await new Promise((resolve, reject) => {
            let attempts = 0;
            const interval = setInterval(() => {
                if (m3u8Url) {
                    clearInterval(interval);
                    resolve();
                } else if (attempts > 20) { // 等待 10 秒
                    clearInterval(interval);
                    reject(new Error("超时：在10秒内未能拦截到 M3U8 请求。"));
                }
                attempts++;
            }, 500);
        });

        const html = await page.content();
        const $ = cheerio.load(html);

        const title = $('.header-left h4').text().trim();
        let thumbnailUrl = '';
        const posterStyle = $('.plyr__poster').attr('style');
        if (posterStyle) {
            const match = posterStyle.match(/url\(['"]?(.*?)['"]?\)/);
            if (match && match[1]) thumbnailUrl = match[1];
        }

        if (!title || !thumbnailUrl || !m3u8Url) {
            throw new Error(`无法提取完整数据。 title: ${!!title}, thumbnail: ${!!thumbnailUrl}, video: ${!!m3u8Url}`);
        }

        return {
            id: `vid_japan_${new Date().getTime()}`,
            url: m3u8Url,
            originalPageUrl: url,
            title,
            thumbnailUrl,
            platform: "Japan",
            category: "未分类",
            tags: [],
            addedAt: new Date().toISOString(),
        };

    } catch (error) {
        console.error('[抓取器-Japan-v3.13] 发生错误:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
            console.log(`[抓取器-Japan-v3.13] 浏览器已关闭。`);
        }
    }
}

// --- 抓取函数 3: "Bilibili" 网站的专属逻辑 (v3.23 - API直连终极版) ---
async function scrapeBilibili(url) {
    console.log(`[抓取器-Bilibili-v3.23] 启动 API 直连策略...`);
    try {
        // 步骤 1: 获取页面 HTML
        const pageResponse = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.bilibili.com/'
            }
        });
        const html = await pageResponse.text();
        const $ = cheerio.load(html);

        // 步骤 2: 从 HTML 中提取标题和封面图
        const title = $('h1.video-title').attr('data-title') || $('title').text().replace(/_哔哩哔哩_bilibili.*/, '').trim();
        let thumbnailUrl = $('meta[property="og:image"]').attr('content') || $('img#wxwork-share-pic').attr('src');
        if (thumbnailUrl && thumbnailUrl.startsWith('//')) {
            thumbnailUrl = 'https:' + thumbnailUrl;
        }
        console.log(`[抓取器-Bilibili-v3.23] 提取到标题: ${title}`);
        console.log(`[抓取器-Bilibili-v3.23] 提取到封面: ${thumbnailUrl}`);

        // 步骤 3: 从 HTML 中解析出包含 cid 和 bvid 的核心数据
        let initialState = null;
        const scriptContent = $('script:contains("window.__INITIAL_STATE__")').html();
        if (scriptContent) {
            const match = scriptContent.match(/window\.__INITIAL_STATE__=({.+?});/);
            if (match && match[1]) {
                try {
                    initialState = JSON.parse(match[1]);
                } catch (e) {
                    throw new Error("解析 INITIAL_STATE 失败，网站结构可能已更新。");
                }
            }
        }

        if (!initialState || !initialState.videoData) {
            throw new Error("未能在页面中找到 videoData。");
        }

        const { bvid, cid } = initialState.videoData;
        console.log(`[抓取器-Bilibili-v3.23] 提取到 bvid: ${bvid}, cid: ${cid}`);

        // 步骤 4: 使用 bvid 和 cid 调用官方 API 获取播放链接
        const apiUrl = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&fnval=16`;
        const apiResponse = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': url
            }
        });
        const playinfoData = await apiResponse.json();

        if (playinfoData.code !== 0 || !playinfoData.data.dash) {
            throw new Error(`调用 Bilibili API 失败: ${playinfoData.message}`);
        }

        const videoStreamUrl = playinfoData.data.dash.video[0].baseUrl;
        const audioStreamUrl = playinfoData.data.dash.audio[0].baseUrl;
        console.log(`[抓取器-Bilibili-v3.23] 成功从 API 获取链接！`);

        if (!title || !thumbnailUrl || !videoStreamUrl || !audioStreamUrl) {
            throw new Error(`未能提取到全部所需数据。`);
        }

        return {
            id: `vid_bilibili_${new Date().getTime()}`,
            url: videoStreamUrl,
            audioUrl: audioStreamUrl,
            originalPageUrl: url,
            title,
            thumbnailUrl,
            platform: "Bilibili",
            category: "未分类",
            tags: [],
            addedAt: new Date().toISOString(),
        };

    } catch (error) {
        console.error('[抓取器-Bilibili-v3.23] 发生严重错误:', error);
        throw error;
    }
}

// --- 抓取函数 2: "XV" 网站的专属逻辑 (来自您的代码，稍作修正) ---
async function scrapeXv(url) {
    console.log(`[抓取器-XV] 开始抓取: ${url}`);
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await response.text();
    const $ = cheerio.load(html);

    const titleElement = $('h2.page-title').clone();
    titleElement.find('span').remove();
    const title = titleElement.text().trim();

    const thumbnailUrl = $('#video-player-bg img').attr('src');

    let videoUrl = '';
    const scriptContent = $('script:contains("html5player.setVideoHLS")').html();
    if (scriptContent) {
        const match = scriptContent.match(/html5player\.setVideoHLS\(['"](.*?)['"]\)/);
        if (match && match[1]) {
            videoUrl = match[1];
        }
    }

    if (!title || !thumbnailUrl || !videoUrl) {
        throw new Error(`无法从 XV 页面提取完整数据。`);
    }

    return {
        id: `vid_xv_${new Date().getTime()}`,
        url: videoUrl,
        originalPageUrl: url, // 修正字段名以保持一致
        title,
        thumbnailUrl,
        platform: "XV",
        category: "未分类",
        tags: [],
        addedAt: new Date().toISOString(),
    };
}

