// 文件路径: app/page.js (v4.1 - 最终修复版)
'use client';

import { useState, useEffect, useMemo } from 'react';
import VideoCard from '@/components/VideoCard';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import AddVideoForm from '@/components/AddVideoForm';
import EditVideoModal from '@/components/EditVideoModal';

const STORAGE_KEY = 'my-video-hub-videos'; // 定义一个本地存储的 key

export default function HomePage() {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [editingVideo, setEditingVideo] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');

    // 核心改造 1: 从 localStorage 读取数据
    useEffect(() => {
        try {
            const storedVideos = localStorage.getItem(STORAGE_KEY);
            if (storedVideos) {
                setVideos(JSON.parse(storedVideos));
            }
        } catch (e) {
            console.error("从 localStorage 读取数据失败:", e);
        }
        setIsLoading(false);
    }, []);

    // 核心改造 2: 每当 videos 状态变化时，将其写入 localStorage
    useEffect(() => {
        try {
            // 只有在非初始加载时才写入，避免覆盖
            if (!isLoading) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
            }
        } catch (e) {
            console.error("写入数据到 localStorage 失败:", e);
        }
    }, [videos, isLoading]);

    // --- 新增的“保存”处理函数 ---
    const handleSaveVideo = (updatedVideo) => {
        setVideos(currentVideos =>
            currentVideos.map(v => v.id === updatedVideo.id ? updatedVideo : v)
        );
        setEditingVideo(null); // 关闭编辑模态框
    };

    // 核心改造 3: 更新“添加视频”逻辑
    const handleVideoAdded = (newVideo) => {
        setVideos(prevVideos => [newVideo, ...prevVideos]);
        setShowAddForm(false);
    };

    // 核心改造 4: 唯一的“删除视频”逻辑
    const handleDeleteVideo = (videoId) => {
        if (window.confirm("您确定要删除这个视频吗?")) {
            setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
            alert('视频已成功删除！');
        }
    };

    // 过滤和分类逻辑
    const filteredVideos = useMemo(() => {
        return videos.filter(video => {
            const matchesCategory = selectedCategory === '全部' || video.category === selectedCategory;
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                                  video.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                                  (video.tags && video.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm)));
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory, videos]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(videos.map(v => v.category || '未分类'));
        return ['全部', ...Array.from(uniqueCategories)];
    }, [videos]);

    const handleCardClick = (video) => setPlayingVideo(video);
    const handleEditClick = (video) => setEditingVideo(video);
    const handleCloseModal = () => setPlayingVideo(null);
    const handleToggleAddForm = () => setShowAddForm(!showAddForm);

    return (
        <main>
            <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between mb-4 pb-3 border-bottom">
                <h1 className="h4 mb-2 mb-md-0">
                    <i className="bi bi-collection-play-fill me-2 text-primary"></i>
                    My Video Hub
                </h1>

                <div className="d-flex align-items-center">
                    <span className="badge bg-secondary me-3">{filteredVideos.length}</span>
                    <button className="btn btn-primary" onClick={handleToggleAddForm}>
                        <i className={`bi ${showAddForm ? 'bi-x-lg' : 'bi-plus-circle-fill'} me-1`}></i>
                        <span className="d-none d-sm-inline">{showAddForm ? '取消' : '添加视频'}</span> {/* 在小屏幕上隐藏文字 */}
                    </button>
                </div>
            </header>

            {showAddForm && <AddVideoForm onVideoAdded={handleVideoAdded} onCancel={handleToggleAddForm} />}

            {/* --- 经过移动端优化的筛选/搜索 UI --- */}
            <div className="row g-2 mb-4 p-3 border rounded bg-light">
                <div className="col-12 col-md-8 mb-2 mb-md-0"> {/* 在手机上占满整行 (col-12)，在桌面占 8/12 */}
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="按标题或标签搜索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-4"> {/* 在手机上占满整行 (col-12)，在桌面占 4/12 */}
                    <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {isLoading && <p className="text-center text-muted">正在加载...</p>}
            {!isLoading && filteredVideos.length === 0 && (
                <p className="text-center text-muted">没有找到匹配的视频。尝试更改筛选条件或添加新视频。</p>
            )}

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 xl-5 g-4">
                {filteredVideos.map((video) => (
                    <VideoCard
                        key={video.id}
                        video={video}
                        onClick={handleCardClick}
                        onDelete={handleDeleteVideo}
                        onEdit={handleEditClick}
                    />
                ))}
            </div>

            {playingVideo && <VideoPlayerModal video={playingVideo} onClose={handleCloseModal} />}
            {editingVideo && <EditVideoModal video={editingVideo} onSave={handleSaveVideo} onClose={handleCloseModal} />}
        </main>
    );
}
