// 文件路径: app/api/proxy/route.js (v4.0 - 缓存优化终极版)

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { promises as fs, createReadStream, createWriteStream } from 'fs';
import path from 'path';

// 定义一个安全、可写的缓存目录
const CACHE_DIR = path.join(process.cwd(), '.next', 'cache', 'video-proxy-cache');

// 一次性设置，确保缓存目录存在
let isCacheDirReady = false;
async function ensureCacheDir() {
    if (!isCacheDirReady) {
        try {
            await fs.mkdir(CACHE_DIR, { recursive: true });
            isCacheDirReady = true;
            console.log(`[Proxy Cache] 缓存目录已准备就绪: ${CACHE_DIR}`);
        } catch (error) {
            console.error('[Proxy Cache] 创建缓存目录失败:', error);
        }
    }
}

// 将 Web Stream 写入 Node.js 文件流的辅助函数
async function writeStreamToFile(stream, filePath) {
    const reader = stream.getReader();
    const fileStream = createWriteStream(filePath);
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fileStream.write(value);
    }
    fileStream.end();
    console.log(`[Proxy Cache] 文件已写入缓存: ${path.basename(filePath)}`);
}

export async function GET(request) {
    await ensureCacheDir();

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const referer = searchParams.get('referer');

    if (!targetUrl) {
        return new Response('代理错误: 缺少 URL 参数', { status: 400 });
    }

    const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    const pathWithoutQuery = targetUrl.split('?')[0];
    const isPlaylist = pathWithoutQuery.endsWith('.m3u8');

    // --- 策略 1: 处理播放列表 (M3U8) ---
    // 播放列表很小，且可能包含会过期的 token，因此我们不缓存它们，每次都重新获取和重写。
    if (isPlaylist) {
        console.log(`[Proxy] Playlist detected. Fetching and rewriting: ${targetUrl}`);
        try {
            const response = await fetch(targetUrl, { headers: { 'Referer': referer || new URL(targetUrl).origin, 'User-Agent': 'Mozilla/5.0' } });
            if (!response.ok) return new Response(`无法获取播放列表: ${response.statusText}`, { status: response.status });

            let m3u8Content = await response.text();
            const rewrittenContent = m3u8Content.split('\n').map(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine || (trimmedLine.startsWith('#') && !trimmedLine.includes('URI="'))) {
                    return line;
                }
                if (trimmedLine.startsWith('#EXT-X-KEY')) {
                    const uriMatch = trimmedLine.match(/URI="([^"]+)"/);
                    if (uriMatch && uriMatch[1]) {
                        const keyUri = uriMatch[1];
                        const absoluteKeyUrl = new URL(keyUri, baseUrl).href;
                        const proxiedKeyUrl = `/api/proxy?url=${encodeURIComponent(absoluteKeyUrl)}&referer=${encodeURIComponent(referer)}`;
                        return trimmedLine.replace(keyUri, proxiedKeyUrl);
                    }
                }
                const absoluteUrl = new URL(trimmedLine, baseUrl).href;
                return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}&referer=${encodeURIComponent(referer)}`;
            }).join('\n');

            return new Response(rewrittenContent, { status: 200, headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } });
        } catch (error) {
            console.error('[Proxy] 处理播放列表时出错:', error);
            return new Response('处理播放列表时出错。', { status: 500 });
        }
    }

    // --- 策略 2: 处理媒体片段和图片 (带缓存) ---
    const hash = createHash('sha256').update(targetUrl).digest('hex');
    const cacheFilePath = path.join(CACHE_DIR, hash);

    try {
        // 尝试访问缓存文件
        await fs.access(cacheFilePath);
        // 缓存命中！
        console.log(`[Proxy Cache] HIT: ${path.basename(targetUrl)}`);
        const stats = await fs.stat(cacheFilePath);
        const fileStream = createReadStream(cacheFilePath);
        return new Response(fileStream, {
            status: 200,
            headers: { 'Content-Length': stats.size.toString(), 'Content-Type': 'application/octet-stream' }
        });
    } catch (error) {
        // 缓存未命中
        console.log(`[Proxy Cache] MISS: ${path.basename(targetUrl)}`);
        try {
            const response = await fetch(targetUrl, { headers: { 'Referer': referer || new URL(targetUrl).origin, 'User-Agent': 'Mozilla/5.0' } });
            if (!response.ok) return new Response(`无法获取目标资源: ${response.statusText}`, { status: response.status });

            // 使用 tee() 将响应流一分为二
            const [streamToClient, streamToCache] = response.body.tee();

            // 异步地将其中一个流写入缓存文件，不阻塞对客户端的响应
            writeStreamToFile(streamToCache, cacheFilePath).catch(err => {
                console.error('[Proxy Cache] 写入缓存失败:', err);
                fs.unlink(cacheFilePath).catch(() => {}); // 尝试清理不完整的文件
            });

            // 立即将另一个流返回给客户端
            return new Response(streamToClient, {
                status: 200,
                headers: response.headers
            });
        } catch (fetchError) {
            console.error('[Proxy] 获取源文件时出错:', fetchError);
            return new Response('获取源文件时出错。', { status: 500 });
        }
    }
}
