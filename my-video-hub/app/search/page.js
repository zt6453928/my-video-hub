// 文件路径: app/search/page.js (修复后)
'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import searchService from '@/services/searchService';
import videoService from '@/services/videoService';
import VideoCard from '@/components/VideoCard';

// 新建一个组件，包含所有需要 useSearchParams 的逻辑
function SearchResults() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const keyword = searchParams.get('q');

    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [addingVideoUrl, setAddingVideoUrl] = useState(null);
    const [addedVideoUrls, setAddedVideoUrls] = useState(new Set());

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

    const handleAddVideo = async (videoFromSearch) => {
        setAddingVideoUrl(videoFromSearch.url);
        try {
            const scrapeResponse = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: videoFromSearch.url }),
            });
            if (!scrapeResponse.ok) throw new Error('刮取视频信息失败');
            const scrapedVideo = await scrapeResponse.json();

            await videoService.addVideo(scrapedVideo);
            setAddedVideoUrls(prev => new Set(prev).add(videoFromSearch.url));
        } catch (error) {
            console.error('添加视频失败:', error);
            alert(`添加 "${videoFromSearch.title}" 失败!`);
        } finally {
            setAddingVideoUrl(null);
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">关于 “{keyword}” 的搜索结果</h2>
                <button className="btn btn-secondary" onClick={() => router.push('/')}>返回首页</button>
            </div>

            {isLoading && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
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

// 主页面组件现在用 Suspense 包裹了客户端组件
export default function SearchPage() {
    return (
        <main className="container pt-3 pb-5">
            <Suspense fallback={<div className="text-center">正在加载搜索结果...</div>}>
                <SearchResults />
            </Suspense>
        </main>
    );
}