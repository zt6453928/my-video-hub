// 文件路径: app/api/scrape/route.js (v4.3 - 性能与健壮性优化版)

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

// --- 假设常量文件已创建 ---
// 如果您还未创建，请先在项目根目录创建 lib/constants.js
// export const DEFAULT_CATEGORY = '未分类';
const DEFAULT_CATEGORY = '未分类';


/**
 * 获取浏览器实例。
 * 优先连接到通过环境变量指定的外部浏览器服务，以获得最佳性能。
 * 如果未指定，则启动一个新的本地 Puppeteer 实例。
 */
async function getBrowser() {
    if (process.env.PUPPETEER_WS_ENDPOINT) {
        console.log(`[Puppeteer] 连接到外部浏览器: ${process.env.PUPPETEER_WS_ENDPOINT}`);
        return puppeteer.connect({ browserWSEndpoint: process.env.PUPPETEER_WS_ENDPOINT });
    }
    console.log('[Puppeteer] 启动新的本地浏览器实例...');
    return puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
}


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

        // --- 核心升级：首先判断链接是否为 M3U8 直链 ---
        if (url.endsWith('.m3u8')) {
            console.log('[调度中心] 检测到 M3U8 直链，直接处理...');
            videoData = handleDirectM3U8(url);
        } else {
            // 如果不是直链，则执行常规的网页抓取逻辑
            console.log(`[调度中心] 收到网页 URL，主机名: ${hostname}`);

            // --- 智能判断，调用不同的抓取函数 ---
            if (hostname.includes('cn.pornhub.com') || hostname.includes('www.pornhub.com')) {
                console.log('[调度中心] 决策: 使用 Happy 网站提取策略...');
                videoData = await scrapeHappy(url);
            } else if (hostname.includes('jable.tv')) {
                console.log('[调度中心] 决策: 使用 Japan 网站提取策略...');
                videoData = await scrapeJapan(url);
            } else if (hostname.includes('bilibili.com') || hostname.includes('b23.tv')) {
                console.log('[调度中心] 决策: 使用 Bilibili 提取策略...');
                videoData = await scrapeBilibili(url);
            } else if (hostname.includes('xvideos.com')) {
                console.log('[调度中心] 决策: 使用 Xv 提取策略...');
                videoData = await scrapeXv(url);
            } else {
                console.log(`[调度中心] 未找到特定策略，将使用通用提取策略...`);
                videoData = await scrapeGeneric(url);
            }
        }

        return NextResponse.json(videoData, { status: 200 });

    } catch (error) {
        console.error('[Scrape API] 处理请求失败:', error);
        // --- 优化：返回更具体的错误信息 ---
        const errorMessage = (error instanceof Error && error.message)
            ? error.message
            : '抓取失败，发生一个未知错误。';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

// --- 新增函数：专门处理 M3U8 直链 ---
function handleDirectM3U8(url) {
    // 尝试从 URL 路径中提取一个有意义的标题
    const pathParts = new URL(url).pathname.split('/');
    const fileName = pathParts[pathParts.length - 1] || 'M3U8 Stream';
    const title = fileName.replace('.m3u8', ''); // 移除文件后缀

    return {
        id: `vid_m3u8_${new Date().getTime()}`,
        url: url,
        originalPageUrl: url,
        title: title,
        thumbnailUrl: '', // 直链无法获取封面
        platform: new URL(url).hostname.replace('www.', '').split('.')[0],
        category: DEFAULT_CATEGORY, // <-- 使用常量
        tags: [],
        addedAt: new Date().toISOString(),
    };
}


// --- 抓取函数: "Happy" 网站的专属逻辑 (v9.4 - 域名转换终极版) ---
async function scrapeHappy(initialUrl) {
    // ... 此函数逻辑不变 ...
    let targetUrl = initialUrl;
    if (targetUrl.includes('www.pornhub.com')) {
        targetUrl = targetUrl.replace('www.pornhub.com', 'cn.pornhub.com');
    }

    const response = await fetch(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });
    if (!response.ok) throw new Error(`请求 Happy 页面失败，状态码: ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1.title span.inlineFree').text().trim() || $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    if (!title) throw new Error('无法从 Happy 页面提取标题，网站结构可能已变更。');

    const thumbnailUrl = $('img#videoElementPoster').attr('src') || $('meta[property="og:image"]').attr('content');
    if (!thumbnailUrl) throw new Error('无法从 Happy 页面提取封面图，网站结构可能已变更。');

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
                    videoUrl = hlsMedia ? hlsMedia.videoUrl : (mediaDefinitions.filter(m => m.videoUrl).pop()?.videoUrl || '');
                }
            } catch (e) {
                console.error("[抓取器-Happy] 解析 flashvars JSON 失败:", e);
                // 解析失败不阻断流程，可能页面本身就是视频
            }
        }
    }

    return {
        id: `vid_happy_${new Date().getTime()}`,
        url: videoUrl || targetUrl,
        originalPageUrl: targetUrl,
        title, thumbnailUrl,
        platform: "Happy",
        isPrivate: true,
        category: DEFAULT_CATEGORY,
        tags: [],
        addedAt: new Date().toISOString(),
    };
}

// --- 抓取函数 2: "Japan" 网站的专属逻辑 (v3.14 - 性能优化版) ---
async function scrapeJapan(url) {
    console.log(`[抓取器-Japan] 启动浏览器连接...`);
    let browser = null;
    let page = null;
    try {
        browser = await getBrowser();
        page = await browser.newPage();

        // --- 核心优化: 禁用不必要的资源加载 ---
        let m3u8Url = '';
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(request.resourceType())) {
                request.abort();
            } else if (request.url().includes('.m3u8')) {
                if (!m3u8Url) { // 只捕获第一个 M3U8 请求
                    console.log(`[抓取器-Japan] 成功拦截到 M3U8 请求: ${request.url()}`);
                    m3u8Url = request.url();
                }
                request.abort(); // 拦截后直接中止，无需下载
            } else {
                request.continue();
            }
        });

        console.log(`[抓取器-Japan] 正在导航到: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        console.log(`[抓取器-Japan] 页面加载完成。`);

        try {
            const playButtonSelector = 'button.plyr__control--overlaid[data-plyr="play"]';
            await page.waitForSelector(playButtonSelector, { visible: true, timeout: 10000 });
            await page.click(playButtonSelector);
            console.log(`[抓取器-Japan] 播放按钮已成功点击。`);
        } catch (e) {
            console.warn(`[抓取器-Japan] 未找到或无法点击播放按钮: ${e.message}，将继续等待网络请求。`);
        }

        // 等待 m3u8Url 变量被赋值
        await page.waitForFunction(() => typeof m3u8Url === 'string' && m3u8Url, { timeout: 15000 }).catch(() => {
             throw new Error("超时：在15秒内未能拦截到 M3U8 请求。");
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

        if (!title) throw new Error("无法提取标题，网站结构可能已变更。");
        if (!thumbnailUrl) throw new Error("无法提取封面图，网站结构可能已变更。");

        return {
            id: `vid_japan_${new Date().getTime()}`,
            url: m3u8Url,
            originalPageUrl: url,
            title,
            thumbnailUrl,
            platform: "Japan",
            isPrivate: true,
            category: DEFAULT_CATEGORY,
            tags: [],
            addedAt: new Date().toISOString(),
        };

    } catch (error) {
        console.error('[抓取器-Japan] 发生错误:', error);
        // 将具体的错误信息抛出，方便前端展示
        throw new Error(`Jable.tv 网站抓取失败: ${error.message}`);
    } finally {
        if (page) await page.close();
        if (browser && process.env.PUPPETEER_WS_ENDPOINT) {
             await browser.disconnect();
        } else if (browser) {
             await browser.close();
        }
        console.log(`[抓取器-Japan] 浏览器会话已关闭。`);
    }
}


// --- 抓取函数 1: "Bilibili" 网站的专属逻辑 ---
async function scrapeBilibili(initialUrl) {
    // ... 此函数逻辑不变 ...
    let targetUrl = initialUrl;
    if (targetUrl.includes('b23.tv')) {
        const shortLinkResponse = await fetch(targetUrl, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
        targetUrl = shortLinkResponse.url;
    }

    const pageResponse = await fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com/' } });
    if (!pageResponse.ok) throw new Error(`获取 Bilibili 页面失败: ${pageResponse.statusText}`);

    const html = await pageResponse.text();
    const $ = cheerio.load(html);

    const title = $('h1.video-title').attr('title') || $('meta[property="og:title"]').attr('content') || 'Bilibili Video';
    let thumbnailUrl = $('meta[property="og:image"]').attr('content');
    if (thumbnailUrl && thumbnailUrl.startsWith('//')) thumbnailUrl = 'https:' + thumbnailUrl;

    let initialState = null;
    const scriptContent = $('script:contains("window.__INITIAL_STATE__")').html();
    if (scriptContent) {
        const match = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/);
        if (match && match[1]) try { initialState = JSON.parse(match[1]); } catch (e) { throw new Error("解析 Bilibili 核心数据失败。"); }
    }
    if (!initialState || !initialState.videoData) throw new Error("未能在 Bilibili 页面中找到视频数据。");

    const { bvid, cid } = initialState.videoData;
    const apiUrl = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&fnval=16`;
    const apiResponse = await fetch(apiUrl, { headers: { 'Referer': targetUrl } });
    const playinfoData = await apiResponse.json();

    if (playinfoData.code !== 0 || !playinfoData.data.dash) throw new Error(`调用 Bilibili API 失败: ${playinfoData.message}`);

    const videoStreamUrl = playinfoData.data.dash.video[0].baseUrl;
    const audioStreamUrl = playinfoData.data.dash.audio[0].baseUrl;

    if (!title || !thumbnailUrl || !videoStreamUrl || !audioStreamUrl) throw new Error(`未能从 Bilibili 提取到全部所需数据。`);

    return {
        id: `vid_bilibili_${new Date().getTime()}`,
        url: videoStreamUrl,
        audioUrl: audioStreamUrl,
        originalPageUrl: targetUrl,
        title, thumbnailUrl,
        platform: "Bilibili", category: DEFAULT_CATEGORY, tags: [],
        addedAt: new Date().toISOString(),
    };
}


// --- 抓取函数 2: 通用备用逻辑 ---
async function scrapeGeneric(url) {
    // ... 此函数逻辑不变 ...
    console.log(`[抓取器-通用] 开始抓取: ${url}`);
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error(`获取页面失败: ${response.statusText}`);

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('h1').first().text().trim() || $('title').text().trim();
    let thumbnailUrl = $('meta[property="og:image"]').attr('content') || $('#video-player-bg img').attr('src');
    if (thumbnailUrl && !thumbnailUrl.startsWith('http')) thumbnailUrl = new URL(thumbnailUrl, url).href;

    let videoUrl = '';
    const scriptContent = $('script').text();
    const urlRegex = /['"](https?:\/\/[^'"]+\.(?:m3u8|mp4)[^'"]*)['"]/g;
    let match;
    while ((match = urlRegex.exec(scriptContent)) !== null) {
        if (match[1].includes('hls') || match[1].includes('720')) { videoUrl = match[1]; break; }
        if (!videoUrl) videoUrl = match[1];
    }
    if (!title) throw new Error(`通用抓取器无法从此页面提取标题。`);
    if (!thumbnailUrl) throw new Error(`通用抓取器无法从此页面提取封面。`);
    if (!videoUrl) throw new Error(`通用抓取器无法从此页面提取视频链接。`);

    return {
        id: `vid_generic_${new Date().getTime()}`,
        url: videoUrl,
        originalPageUrl: url,
        title, thumbnailUrl,
        platform: new URL(url).hostname.replace('www.', '').split('.')[0],
        category: DEFAULT_CATEGORY, tags: [],
        addedAt: new Date().toISOString(),
    };
}

// --- 抓取函数: "XV" 网站的专属逻辑 ---
async function scrapeXv(url) {
    // ... 此函数逻辑不变 ...
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
        if (match && match[1]) videoUrl = match[1];
    }

    if (!title) throw new Error(`无法从 XV 页面提取标题。`);
    if (!thumbnailUrl) throw new Error(`无法从 XV 页面提取封面图。`);
    if (!videoUrl) throw new Error(`无法从 XV 页面提取视频链接。`);

    return {
        id: `vid_xv_${new Date().getTime()}`,
        url: videoUrl,
        originalPageUrl: url,
        title, thumbnailUrl,
        platform: "XV",
        isPrivate: true,
        category: DEFAULT_CATEGORY,
        tags: [],
        addedAt: new Date().toISOString(),
    };
}