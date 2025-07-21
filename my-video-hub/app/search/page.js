// 文件路径: app/search/page.js (最终修复版)
'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import searchService from '@/services/searchService';
import videoService from '@/services/videoService';
import VideoCard from '@/components/VideoCard';
import { DEFAULT_CATEGORY } from '@/lib/constants'; // 引入常量

// 客户端组件
function SearchResults() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const keyword = searchParams.get('q');

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [addingVideoUrl, setAddingVideoUrl] = useState(null);
    const [addedVideoUrls, setAddedVideoUrls] = useState(new Set());
    const [searchSource, setSearchSource] = useState('all');

    const performSearch = useCallback(() => {
        if (!keyword) {
            router.push('/');
            return;
        }
        setIsLoading(true);
        searchService.search(keyword, searchSource)
            .then(data => setResults(data))
            .catch(err => console.error("搜索失败:", err))
            .finally(() => setIsLoading(false));
    }, [keyword, searchSource, router]);

    useEffect(() => {
        performSearch();
    }, [performSearch]);

    // --- 核心修改：优化 handleAddVideo 函数 ---
    const handleAddVideo = async (videoFromSearch) => {
        setAddingVideoUrl(videoFromSearch.url);
        try {
            let videoToSave;

            // 如果是 YouTube 视频，则直接使用已有信息，跳过 scraping
            if (videoFromSearch.platform === 'YouTube') {
                console.log('检测到 YouTube 视频，跳过二次抓取步骤。');
                videoToSave = {
                    originalPageUrl: videoFromSearch.url,
                    url: videoFromSearch.url,
                    title: videoFromSearch.title,
                    thumbnailUrl: videoFromSearch.thumbnailUrl,
                    platform: videoFromSearch.platform,
                    category: DEFAULT_CATEGORY,
                    tags: [],
                };
            } else {
                // 对于其他平台（如Bilibili），仍然使用原有的 scraping 流程
                const scrapeResponse = await fetch('/api/scrape', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: videoFromSearch.url }),
                });

                if (!scrapeResponse.ok) {
                    const errorData = await scrapeResponse.json();
                    throw new Error(errorData.message || '刮取视频信息失败');
                }
                videoToSave = await scrapeResponse.json();
            }

            // 将整理好的数据发送到后端保存
            await videoService.addVideo(videoToSave);
            setAddedVideoUrls(prev => new Set(prev).add(videoFromSearch.url));

        } catch (error) {
            console.error('添加视频失败:', error);
            alert(`添加 "${videoFromSearch.title}" 失败! 原因: ${error.message}`);
        } finally {
            setAddingVideoUrl(null);
        }
    };

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                <h2 className="mb-0">关于 “{keyword}” 的搜索结果</h2>
                <button className="btn btn-secondary" onClick={() => router.push('/')}>返回首页</button>
            </div>

            <div className="d-flex justify-content-center mb-4">
                <div className="btn-group" role="group" aria-label="Search source">
                    <input type="radio" className="btn-check" name="source" id="sourceAll" autoComplete="off" checked={searchSource === 'all'} onChange={() => setSearchSource('all')} />
                    <label className="btn btn-outline-primary" htmlFor="sourceAll">全部</label>

                    <input type="radio" className="btn-check" name="source" id="sourceBilibili" autoComplete="off" checked={searchSource === 'bilibili'} onChange={() => setSearchSource('bilibili')} />
                    <label className="btn btn-outline-primary" htmlFor="sourceBilibili">Bilibili</label>

                    <input type="radio" className="btn-check" name="source" id="sourceYoutube" autoComplete="off" checked={searchSource === 'youtube'} onChange={() => setSearchSource('youtube')} />
                    <label className="btn btn-outline-primary" htmlFor="sourceYoutube">YouTube</label>
                </div>
            </div>

            {isLoading && (
                <div className="text-center">
                    <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                    <p className="mt-2">正在全网搜索中...</p>
                </div>
            )}

            {!isLoading && results.length === 0 && (
                <p className="text-center text-muted">未找到任何相关视频。</p>
            )}

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {results.map((video) => (
                    <VideoCard
                        key={video.url}
                        video={video}
                        variant="search"
                        onAdd={handleAddVideo}
                        isAdding={addingVideoUrl === video.url}
                        isAdded={addedVideoUrls.has(video.url)}
                    />
                ))}
            </div>
        </>
    );
}

// 主页面组件保持不变
export default function SearchPage() {
    return (
        <main className="container pt-3 pb-5">
            <Suspense fallback={<div className="text-center">正在加载搜索结果...</div>}>
                <SearchResults />
            </Suspense>
        </main>
    );
}