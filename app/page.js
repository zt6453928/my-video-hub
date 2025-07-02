// 文件路径: app/page.js (v6.7 - 最终版)
'use client';
import { useState, useEffect, useMemo } from 'react';
import VideoCard from '@/components/VideoCard';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import AddVideoForm from '@/components/AddVideoForm';
import EditVideoModal from '@/components/EditVideoModal';

const STORAGE_KEY = 'my-video-hub-videos';

export default function HomePage() {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [editingVideo, setEditingVideo] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');

    useEffect(() => {
        try {
            const storedVideos = localStorage.getItem(STORAGE_KEY);
            if (storedVideos) setVideos(JSON.parse(storedVideos));
        } catch (e) { console.error("读取数据失败:", e); }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
        }
    }, [videos, isLoading]);

    const handleSaveVideo = (updatedVideo) => {
        setVideos(currentVideos => currentVideos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
        setEditingVideo(null);
    };
    const handleVideoAdded = (newVideo) => setVideos(prev => [newVideo, ...prev]);
    const handleDeleteVideo = (videoId) => {
        if (window.confirm("您确定要删除这个视频吗?")) {
            setVideos(prev => prev.filter(v => v.id !== videoId));
        }
    };
    const handleCardClick = (video) => setPlayingVideo(video);
    const handleEditClick = (video) => setEditingVideo(video);
    const handleCloseModal = () => { setPlayingVideo(null); setEditingVideo(null); };
    const handleToggleAddForm = () => setShowAddForm(!showAddForm);

    const filteredVideos = useMemo(() => {
        return videos.filter(video => {
            const matchesCategory = selectedCategory === '全部' || (video.category || '未分类') === selectedCategory;
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || video.title.toLowerCase().includes(lowerCaseSearchTerm);
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory, videos]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set(videos.map(v => v.category || '未分类'));
        return ['全部', ...Array.from(uniqueCategories)];
    }, [videos]);

    return (
        <main className="container pt-3 pb-5">
            <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between mb-4 pb-3 border-bottom">
                <h1 className="h4 mb-2 mb-md-0 d-flex align-items-center">
                    <i className="bi bi-collection-play-fill me-2 text-primary fs-3"></i>
                    <span>My Video Hub</span>
                </h1>
                <div className="d-flex align-items-center">
                    <span className="badge bg-secondary me-3">{filteredVideos.length}</span>
                    <button className="btn btn-primary d-none d-md-flex align-items-center" onClick={handleToggleAddForm}>
                        <i className={`bi ${showAddForm ? 'bi-x' : 'bi-plus-lg'} me-1`}></i>
                        <span>{showAddForm ? '取消添加' : '添加视频'}</span>
                    </button>
                </div>
            </header>

            {showAddForm && <AddVideoForm onVideoAdded={handleVideoAdded} onCancel={handleToggleAddForm} />}

            <div className="row g-2 mb-4 p-3 border rounded bg-light">
                <div className="col-12 col-md-8 mb-2 mb-md-0">
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input type="text" className="form-control" placeholder="按标题或标签搜索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {isLoading && <p className="text-center text-muted">正在加载...</p>}
            {!isLoading && filteredVideos.length === 0 && (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-camera-video-off" style={{fontSize: '3rem'}}></i>
                    <p className="mt-3">您的视频中心还是空的</p>
                </div>
            )}

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {filteredVideos.map((video) => (
                    <VideoCard key={video.id} video={video} onClick={handleCardClick} onDelete={handleDeleteVideo} onEdit={handleEditClick} />
                ))}
            </div>

            {playingVideo && <VideoPlayerModal video={playingVideo} onClose={handleCloseModal} />}
            {editingVideo && <EditVideoModal video={editingVideo} onSave={handleSaveVideo} onClose={handleCloseModal} />}

            <button onClick={handleToggleAddForm} className="btn btn-primary btn-lg rounded-circle position-fixed d-md-none shadow-lg" style={{ bottom: '25px', right: '25px', width: '60px', height: '60px', zIndex: 1050 }} aria-label="添加新视频">
                <i className={`bi ${showAddForm ? 'bi-x-lg' : 'bi-plus-lg'}`} style={{fontSize: '1.5rem'}}></i>
            </button>
        </main>
    );
}