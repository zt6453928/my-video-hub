// 文件路径: components/VideoPlayerModal.js (最终修复版 - 支持 YouTube 播放)
'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function VideoPlayerModal({ video, onClose, onVideoEnded }) {
    const modalRef = useRef(null);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const modalInstanceRef = useRef(null);
    const hlsInstanceRef = useRef(null);

    // --- 新增状态来处理平台判断 ---
    const [isYoutube, setIsYoutube] = useState(false);
    const [youtubeVideoId, setYoutubeVideoId] = useState('');

    useEffect(() => {
        if (video) {
            const isYouTubeVideo = video.platform === 'YouTube';
            setIsYoutube(isYouTubeVideo);
            if (isYouTubeVideo) {
                // 从 YouTube URL 中提取视频 ID
                try {
                    const url = new URL(video.url);
                    const videoId = url.searchParams.get('v');
                    setYoutubeVideoId(videoId);
                } catch (e) {
                    console.error("解析YouTube URL失败:", e);
                }
            }
        }
    }, [video]);

    useEffect(() => {
        if (!modalRef.current) return;
        modalInstanceRef.current = new window.bootstrap.Modal(modalRef.current);
        const handleHidden = () => {
            // 清理逻辑
            if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.removeAttribute('src');
                videoRef.current.load();
            }
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = null;
            }
            setIsYoutube(false); // 重置状态
            setYoutubeVideoId(''); // 重置状态
            onClose();
        };
        modalRef.current.addEventListener('hidden.bs.modal', handleHidden);
        return () => {
            if (modalRef.current) modalInstanceRef.current?.removeEventListener('hidden.bs.modal', handleHidden);
            if (modalInstanceRef.current) modalInstanceRef.current.dispose();
        };
    }, [onClose]);

    useEffect(() => {
        if (video) {
            modalInstanceRef.current?.show();

            // 如果不是 YouTube 视频，才执行原有的播放器逻辑
            if (!isYoutube) {
                const player = videoRef.current;
                if (!player) return;

                let onPlay, onPause, onSeeked, onRateChange, onEnded;
                const cleanupPlayer = () => {
                    player.removeEventListener('play', onPlay);
                    player.removeEventListener('pause', onPause);
                    player.removeEventListener('seeked', onSeeked);
                    player.removeEventListener('ratechange', onRateChange);
                    player.removeEventListener('ended', onEnded);
                    if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.src = '';
                    }
                    player.pause();
                    player.removeAttribute('src');
                    player.load();
                };

                cleanupPlayer();

                const platform = video.platform?.toLowerCase();
                const refererUrl = video.originalPageUrl || video.url;
                const videoProxyUrl = `/api/proxy?url=${encodeURIComponent(video.url)}&referer=${encodeURIComponent(refererUrl)}`;

                onEnded = () => onVideoEnded && onVideoEnded(video.id || video._id);
                player.addEventListener('ended', onEnded);

                if (platform === 'bilibili' && video.audioUrl) {
                    const audioProxyUrl = `/api/proxy?url=${encodeURIComponent(video.audioUrl)}&referer=${encodeURIComponent(refererUrl)}`;
                    player.src = videoProxyUrl;
                    audioRef.current = new Audio(audioProxyUrl);
                    audioRef.current.crossOrigin = "anonymous";
                    const audio = audioRef.current;
                    onPlay = () => { audio.play().catch(e => {}); audio.currentTime = player.currentTime; audio.playbackRate = player.playbackRate; };
                    onPause = () => audio.pause();
                    onSeeked = () => { audio.currentTime = player.currentTime; };
                    onRateChange = () => { audio.playbackRate = player.playbackRate; };
                    player.addEventListener('play', onPlay);
                    player.addEventListener('pause', onPause);
                    player.addEventListener('seeked', onSeeked);
                    player.addEventListener('ratechange', onRateChange);
                } else if (window.Hls && window.Hls.isSupported() && video.url.includes('.m3u8')) {
                    hlsInstanceRef.current = new window.Hls();
                    hlsInstanceRef.current.loadSource(videoProxyUrl);
                    hlsInstanceRef.current.attachMedia(player);
                } else {
                    player.src = videoProxyUrl;
                }
                player.play().catch(e => console.error("视频播放失败:", e));

                return cleanupPlayer;
            }
        } else {
            modalInstanceRef.current?.hide();
        }
    }, [video, isYoutube, onVideoEnded]);

    const posterUrl = video?.thumbnailUrl ? `/api/proxy?url=${encodeURIComponent(video.thumbnailUrl.split('@')[0])}&referer=${encodeURIComponent(video.originalPageUrl || video.url)}` : '';

    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden={!video}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content bg-dark text-white">
                    <div className="modal-header border-secondary">
                        <h5 className="modal-title text-truncate">{video?.title}</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-0">
                        <div className="ratio ratio-16x9">
                            {/* --- 核心修改：根据是否是 YouTube 视频，渲染不同播放器 --- */}
                            {isYoutube ? (
                                <iframe
                                    className="w-100 h-100"
                                    src={`http://googleusercontent.com/youtube.com/8{youtubeVideoId}?autoplay=1`}
                                    title={video?.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <video
                                    ref={videoRef}
                                    id="video-player"
                                    className="w-100 h-100 bg-black"
                                    controls
                                    autoPlay
                                    crossOrigin="anonymous"
                                    poster={posterUrl}
                                ></video>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}