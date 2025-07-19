// 文件路径: app/search/page.js (功能完整版)
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import searchService from '@/services/searchService';
import videoService from '@/services/videoService'; // <-- 引入 videoService
import VideoCard from '@/components/VideoCard';

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const keyword = searchParams.get('q');

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- 核心修改：新增状态来管理添加过程 ---
    const [addingVideoUrl, setAddingVideoUrl] = useState(null); // 正在添加的视频URL
    const [addedVideoUrls, setAddedVideoUrls] = useState(new Set()); // 已成功添加的视频URL集合

    useEffect(() => {
        if (!keyword) {
            router.push('/');
            return;
        }

        setIsLoading(true);
        searchService.search(keyword)
            .then(data => setResults(data))
            .catch(err => console.error("搜索失败:", err))
            .finally(() => setIsLoading(false));
    }, [keyword, router]);

    // --- 核心修改：实现添加视频的函数 ---
    const handleAddVideo = async (videoFromSearch) => {
        setAddingVideoUrl(videoFromSearch.url);
        try {
            // 1. 调用刮取 API 获取详细信息
            const scrapeResponse = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: videoFromSearch.url }),
            });
            if (!scrapeResponse.ok) throw new Error('刮取视频信息失败');
            const scrapedVideo = await scrapeResponse.json();

            // 2. 调用 videoService 将完整信息保存到数据库
            await videoService.addVideo(scrapedVideo);

            // 3. 更新 UI 状态
            setAddedVideoUrls(prev => new Set(prev).add(videoFromSearch.url));

        } catch (error) {
            console.error('添加视频失败:', error);
            alert(`添加 "${videoFromSearch.title}" 失败!`);
        } finally {
            setAddingVideoUrl(null);
        }
    };

    return (
        <main className="container pt-3 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">关于 “{keyword}” 的搜索结果</h2>
                <button className="btn btn-secondary" onClick={() => router.push('/')}>返回首页</button>
            </div>

            {isLoading && <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div><p className="mt-2">正在全网搜索中...</p></div>}

            {!isLoading && results.length === 0 && (
                <p className="text-center text-muted">未找到任何相关视频。</p>
            )}

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {results.map((video) => (
                    <VideoCard
                        key={video.url}
                        video={video}
                        variant="search" // <-- 告诉卡片这是搜索结果
                        onAdd={handleAddVideo}
                        isAdding={addingVideoUrl === video.url}
                        isAdded={addedVideoUrls.has(video.url)}
                    />
                ))}
            </div>
        </main>
    );
}