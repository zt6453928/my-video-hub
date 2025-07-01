// 文件路径: components/VideoPlayerModal.js (v4.1 - 专业音视频同步终极版)
'use client';

import React, { useEffect, useRef } from 'react';

export default function VideoPlayerModal({ video, onClose }) {
    const modalRef = useRef(null);
    const videoRef = useRef(null);

    // 播放器渲染逻辑
    const renderPlayer = () => {
        const platform = video.platform ? video.platform.toLowerCase() : '';

        // 策略1: 如果是 YouTube, 使用 iframe
        if (platform.includes('youtube')) {
            const pageUrl = video.originalPageUrl || video.url;
            try {
                const url = new URL(pageUrl);
                const videoId = url.searchParams.get('v');
                if (videoId) {
                    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                    return <iframe src={embedUrl} title={video.title} className="w-100 h-100" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
                }
            } catch (e) { /* 忽略解析错误 */ }
        }

        // 策略2: 对于所有其他平台 (Bilibili, XV, Happy 等), 都默认使用 <video> 标签
        // 封面图现在也通过代理加载，以解决防盗链问题
        return (
            <video
                ref={videoRef}
                id="video-player"
                className="w-100 h-100 bg-black"
                controls
                autoPlay
                crossOrigin="anonymous"
                poster={video.thumbnailUrl ? `/api/proxy?url=${encodeURIComponent(video.thumbnailUrl)}&referer=${encodeURIComponent(video.originalPageUrl || video.url)}` : ''}
            ></video>
        );
    };

    // 播放逻辑
    useEffect(() => {
        if (!video || !modalRef.current) return;

        const modalInstance = window.bootstrap.Modal.getOrCreateInstance(modalRef.current);
        modalInstance.show();
        const handleHide = () => onClose();
        modalRef.current.addEventListener('hidden.bs.modal', handleHide);

        let hls = null;
        let audio = null;

        if (videoRef.current) {
            const player = videoRef.current;
            const platform = video.platform ? video.platform.toLowerCase() : '';
            const refererUrl = video.originalPageUrl || video.url;
            const videoProxyUrl = `/api/proxy?url=${encodeURIComponent(video.url)}&referer=${encodeURIComponent(refererUrl)}`;

            // --- 核心修复：Bilibili 专业音视频同步逻辑 ---
            if (platform === 'bilibili' && video.audioUrl) {
                console.log("[播放器] Bilibili 模式: 启动专业同步逻辑...");
                const audioProxyUrl = `/api/proxy?url=${encodeURIComponent(video.audioUrl)}&referer=${encodeURIComponent(refererUrl)}`;

                player.src = videoProxyUrl;
                audio = new Audio(audioProxyUrl);
                audio.crossOrigin = "anonymous";

                let isSyncing = false;
                const syncTolerance = 0.5; // 允许 0.5 秒的音画误差

                const playBoth = () => {
                    const videoPromise = player.play();
                    const audioPromise = audio.play();
                    if (videoPromise !== undefined) videoPromise.catch(e => console.error("视频播放失败:", e));
                    if (audioPromise !== undefined) audioPromise.catch(e => console.error("音频播放失败:", e));
                };
                const pauseBoth = () => { player.pause(); audio.pause(); };

                const onPlay = () => playBoth();
                const onPause = () => pauseBoth();

                // 当拖动视频进度条时，同步音频
                const onVideoSeeking = () => {
                    if (!isSyncing && Math.abs(player.currentTime - audio.currentTime) > syncTolerance) {
                        console.log(`同步音频到: ${player.currentTime}`);
                        audio.currentTime = player.currentTime;
                    }
                };

                // 当音频加载足够可以播放时，尝试与视频同步
                const onAudioCanPlay = () => {
                    if (Math.abs(player.currentTime - audio.currentTime) > syncTolerance) {
                        audio.currentTime = player.currentTime;
                    }
                };

                player.addEventListener('play', onPlay);
                player.addEventListener('pause', onPause);
                player.addEventListener('seeking', onVideoSeeking);
                audio.addEventListener('canplay', onAudioCanPlay);

                // 清理函数
                return () => {
                    player.removeEventListener('play', onPlay);
                    player.removeEventListener('pause', onPause);
                    player.removeEventListener('seeking', onVideoSeeking);
                    if (audio) {
                        audio.removeEventListener('canplay', onAudioCanPlay);
                        audio.pause();
                        audio.src = ''; // 释放资源
                    }
                };
            }
            // --- 其他 HLS 视频播放逻辑 ---
            else if (window.Hls && window.Hls.isSupported()) {
                console.log("[播放器] HLS 模式: 启动 hls.js...");
                hls = new window.Hls();
                hls.loadSource(videoProxyUrl);
                hls.attachMedia(player);
            }
        }

        return () => {
            if (modalRef.current) modalRef.current.removeEventListener('hidden.bs.modal', handleHide);
            if (hls) hls.destroy();
            if (audio) {
                audio.pause();
                audio.src = '';
            }
        };
    }, [video, onClose]);

    if (!video) return null;

    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content bg-dark text-white">
                    <div className="modal-header border-secondary">
                        <h5 className="modal-title text-truncate">{video.title}</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body p-0">
                        <div className="ratio ratio-16x9">{renderPlayer()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
