// 文件路径: app/page.js (水合错误最终修复版)
'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VideoCard from '@/components/VideoCard';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import AddVideoForm from '@/components/AddVideoForm';
import EditVideoModal from '@/components/EditVideoModal';
import PasswordModal from '@/components/PasswordModal';
import CategoryManager from '@/components/CategoryManager';
import Login from '@/components/Login';
import { useDebounce } from '@/hooks/useDebounce';

// 引入所有服务
import authService from '@/services/authService';
import videoService from '@/services/videoService';
import categoryService from '@/services/categoryService';

// 引入所有需要的常量
import {
    DEFAULT_CATEGORY,
    AUTO_LOCK_TIMEOUT
} from '@/lib/constants';

export default function HomePage() {
    const router = useRouter();
    // --- 核心修复：新增一个 state 来确保组件只在客户端挂载后才渲染 ---
    const [isClient, setIsClient] = useState(false);

    // --- 认证与应用加载状态 ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- 核心数据状态 ---
    const [videos, setVideos] = useState([]);
    const [allCategories, setAllCategories] = useState([DEFAULT_CATEGORY]);

    // --- UI 与交互状态 ---
    const [playingVideo, setPlayingVideo] = useState(null);
    const [editingVideo, setEditingVideo] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);

    // --- 筛选状态 ---
    const [searchTerm, setSearchTerm] = useState('');
    const [localFilterTerm, setLocalFilterTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');

    // --- 私密空间状态 ---
    const [isPrivateMode, setIsPrivateMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordModalMode, setPasswordModalMode] = useState('verify');

    const debouncedLocalFilterTerm = useDebounce(localFilterTerm, 300);
    const autoLockTimer = useRef(null);

    // --- 核心修复：使用这个 useEffect 来标记客户端渲染已开始 ---
    useEffect(() => {
        // 这个 effect 只会在客户端运行一次
        const user = authService.getCurrentUser();
        if (user && user.token) {
            setCurrentUser(user);
            setIsAuthenticated(true); // 先设置认证状态
        }
        setIsClient(true); // 最后标记客户端已准备就绪
    }, []);

    // --- 核心修复：数据加载的 useEffect 现在依赖 isAuthenticated ---
    useEffect(() => {
        // 只有在认证成功后才去获取数据
        if (isAuthenticated) {
            console.log("用户已认证，开始获取数据...");
            setIsLoading(true);
            Promise.all([
                videoService.getVideos(),
                categoryService.getCategories()
            ])
            .then(([videoData, categoryData]) => {
                setVideos(videoData);
                if (!categoryData.includes(DEFAULT_CATEGORY)) {
                    setAllCategories([DEFAULT_CATEGORY, ...categoryData]);
                } else {
                    setAllCategories(categoryData);
                }
            })
            .catch(err => {
                console.error("获取数据失败:", err);
                if (err.response && err.response.status === 401) {
                    authService.logout();
                    window.location.reload();
                }
            })
            .finally(() => setIsLoading(false));
        } else {
            // 如果未认证，也需要停止加载状态
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    // --- 自动锁定私密空间 ---
    const resetAutoLockTimer = useCallback(() => {
        clearTimeout(autoLockTimer.current);
        if (isPrivateMode) {
            autoLockTimer.current = setTimeout(() => {
                setIsPrivateMode(false);
                console.log("私密空间已自动锁定。");
            }, AUTO_LOCK_TIMEOUT);
        }
    }, [isPrivateMode]);

    useEffect(() => {
        if (isPrivateMode) {
            resetAutoLockTimer();
            window.addEventListener('mousemove', resetAutoLockTimer);
            window.addEventListener('keydown', resetAutoLockTimer);
            window.addEventListener('click', resetAutoLockTimer);

            return () => {
                window.removeEventListener('mousemove', resetAutoLockTimer);
                window.removeEventListener('keydown', resetAutoLockTimer);
                window.removeEventListener('click', resetAutoLockTimer);
                clearTimeout(autoLockTimer.current);
            };
        }
    }, [isPrivateMode, resetAutoLockTimer]);

    // --- 事件处理函数 ---
    const handleLoginSuccess = () => window.location.reload();
    const handleLogout = () => {
        authService.logout();
        window.location.reload();
    };

    const handleAddCategory = async (newCategory) => {
        const trimmedCategory = newCategory.trim();
        if (trimmedCategory && !allCategories.includes(trimmedCategory)) {
            try {
                const addedCat = await categoryService.addCategory(trimmedCategory);
                setAllCategories(prev => [...prev, addedCat].sort());
            } catch (error) {
                alert(`添加分类失败: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleDeleteCategory = async (categoryToDelete) => {
        if (categoryToDelete === DEFAULT_CATEGORY) {
            alert('不能删除默认分类！');
            return;
        }
        if (window.confirm(`确定要删除分类 "${categoryToDelete}" 吗？\n属于此分类的视频将被归为“${DEFAULT_CATEGORY}”。`)) {
            try {
                await categoryService.deleteCategory(categoryToDelete);
                setAllCategories(prev => prev.filter(cat => cat !== categoryToDelete));
                setVideos(prevVideos => prevVideos.map(video =>
                    video.category === categoryToDelete ? { ...video, category: DEFAULT_CATEGORY } : video
                ));
            } catch (error) {
                alert(`删除分类失败: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleSaveVideo = async (updatedVideo) => {
        try {
            const data = await videoService.updateVideo(updatedVideo._id, updatedVideo);
            setVideos(videos.map(v => (v._id === data._id ? data : v)));
            setEditingVideo(null);
        } catch (error) {
            alert(`更新失败: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleVideoAdded = async (videoData) => {
        try {
            const newVideo = await videoService.addVideo(videoData);
            setVideos(prev => [newVideo, ...prev]);
            setShowAddForm(false);
        } catch (error) {
            alert(`添加失败: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (window.confirm("您确定要删除这个视频吗?")) {
            try {
                await videoService.deleteVideo(videoId);
                setVideos(prev => prev.filter(v => v._id !== videoId));
            } catch (error) {
                alert(`删除失败: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleLockIconClick = () => {
        if (isPrivateMode) {
            setIsPrivateMode(false);
            return;
        }
        const hasPassword = !!localStorage.getItem("private_zone_hash");
        setPasswordModalMode(hasPassword ? 'verify' : 'setup');
        setShowPasswordModal(true);
    };

    const handlePasswordSet = (hashedPin) => {
        localStorage.setItem("private_zone_hash", hashedPin);
        setIsPrivateMode(true);
        setShowPasswordModal(false);
    };

    const handleLockIconKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLockIconClick();
        }
    };

    const handleCorrectPassword = () => {
        setIsPrivateMode(true);
        setShowPasswordModal(false);
    };

    const handleCardClick = (video) => setPlayingVideo(video);
    const handleEditClick = (video) => setEditingVideo(video);
    const handleCloseModal = () => { setPlayingVideo(null); setEditingVideo(null); };
    const handleToggleAddForm = () => setShowAddForm(!showAddForm);

    const handleGlobalSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    // --- 派生状态 (Derived State) ---
    const filteredVideos = useMemo(() => {
        const sourceVideos = videos.filter(video => isPrivateMode ? video.isPrivate === true : !video.isPrivate);
        return sourceVideos.filter(video => {
            const matchesCategory = selectedCategory === '全部' || (video.category || DEFAULT_CATEGORY) === selectedCategory;
            const lowerCaseFilterTerm = debouncedLocalFilterTerm.toLowerCase();
            const matchesSearch = !debouncedLocalFilterTerm || video.title.toLowerCase().includes(lowerCaseFilterTerm);
            return matchesCategory && matchesSearch;
        });
    }, [debouncedLocalFilterTerm, selectedCategory, videos, isPrivateMode]);

    const categoriesForFilter = useMemo(() => {
        const sourceVideos = videos.filter(video => isPrivateMode ? video.isPrivate === true : !video.isPrivate);
        const uniqueCategories = new Set(sourceVideos.map(v => v.category || DEFAULT_CATEGORY));
        return ['全部', ...Array.from(uniqueCategories).filter(c => c !== DEFAULT_CATEGORY).sort()];
    }, [videos, isPrivateMode]);

    // --- 渲染逻辑 ---
    if (!isClient) {
        // 在 isClient 变为 true 之前，返回 null 或一个加载指示器，
        // 确保服务器和客户端初次渲染的内容一致。
        return null;
    }

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
    }

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <main className="container pt-3 pb-5">
            <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between mb-4 pb-3 border-bottom">
                <h1 className="h4 mb-2 mb-md-0 d-flex align-items-center">
                    <i className={`bi ${isPrivateMode ? 'bi-shield-lock-fill text-danger' : 'bi-collection-play-fill text-primary'} me-2 fs-3`}></i>
                    <span>{isPrivateMode ? '私密空间' : 'My Video Hub'}</span>
                </h1>
                <div className="d-flex align-items-center">
                    <span className="d-none d-md-inline me-3">欢迎, {currentUser.username}</span>
                    <button onClick={handleLogout} className="btn btn-sm btn-outline-danger me-2">登出</button>
                    <span
                        title={isPrivateMode ? "锁定并退出私密空间" : "进入私密空间"}
                        onClick={handleLockIconClick}
                        onKeyDown={handleLockIconKeyDown}
                        role="button"
                        tabIndex="0"
                        aria-label={isPrivateMode ? "锁定并退出私密空间" : "进入私密空间"}
                    >
                        <i className={`lock-icon bi ${isPrivateMode ? 'bi-unlock-fill' : 'bi-lock-fill'} fs-4 me-3`}></i>
                    </span>
                    <span className="badge bg-secondary me-3">{filteredVideos.length}</span>
                    <button className="btn btn-outline-secondary d-none d-md-flex align-items-center me-2" onClick={() => setShowCategoryManager(true)}>
                        <i className="bi bi-tags-fill me-1"></i>
                        <span>管理分类</span>
                    </button>
                    <button className="btn btn-primary d-none d-md-flex align-items-center" onClick={handleToggleAddForm}>
                        <i className={`bi ${showAddForm ? 'bi-x' : 'bi-plus-lg'} me-1`}></i>
                        <span>{showAddForm ? '取消添加' : '添加视频'}</span>
                    </button>
                </div>
            </header>

            <form onSubmit={handleGlobalSearchSubmit} className="mb-4">
                <div className="input-group input-group-lg">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="全网搜索视频（B站...）"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                        <i className="bi bi-search me-2"></i>搜索
                    </button>
                </div>
            </form>

            <hr />

            <div className="row g-2 mb-4 align-items-center">
                <div className="col-12 col-md-8">
                    <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-filter"></i></span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="筛选我的收藏..."
                            value={localFilterTerm}
                            onChange={(e) => setLocalFilterTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-4">
                     <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categoriesForFilter.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {showAddForm && <AddVideoForm onVideoAdded={handleVideoAdded} onCancel={handleToggleAddForm} allCategories={allCategories} onAddCategory={handleAddCategory} />}

            {videos.length > 0 && filteredVideos.length === 0 && (
                <div className="text-center text-muted py-5">
                    <p>在当前分类下没有找到匹配的视频。</p>
                </div>
            )}

            {videos.length === 0 && !isLoading && (
                 <div className="text-center text-muted py-5">
                    <i className="bi bi-camera-video-off" style={{fontSize: '3rem'}}></i>
                    <p className="mt-3">{isPrivateMode ? '私密空间是空的' : '您的视频中心还是空的，快去添加第一个视频吧！'}</p>
                </div>
            )}

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {filteredVideos.map((video) => (
                    <VideoCard
                        key={video._id}
                        video={video}
                        onClick={() => handleCardClick(video)}
                        onDelete={() => handleDeleteVideo(video._id)}
                        onEdit={() => handleEditClick(video)}
                    />
                ))}
            </div>

            {playingVideo && <VideoPlayerModal video={playingVideo} onClose={handleCloseModal} />}
            {editingVideo && <EditVideoModal video={editingVideo} onSave={handleSaveVideo} onClose={() => setEditingVideo(null)} allCategories={allCategories} />}
            {showPasswordModal && <PasswordModal mode={passwordModalMode} onCorrectPassword={handleCorrectPassword} onPasswordSet={handlePasswordSet} onClose={() => setShowPasswordModal(false)} />}
            {showCategoryManager && <CategoryManager allCategories={allCategories} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} onClose={() => setShowCategoryManager(false)} />}

            <button onClick={handleToggleAddForm} className="btn btn-primary btn-lg rounded-circle position-fixed d-md-none shadow-lg" style={{ bottom: '25px', right: '25px', width: '60px', height: '60px', zIndex: 1050 }} aria-label="添加新视频">
                <i className={`bi ${showAddForm ? 'bi-x' : 'bi-plus-lg'}`} style={{fontSize: '1.5rem'}}></i>
            </button>
        </main>
    );
}