// 文件路径: components/VideoPlayerModal.js (恢复临时链接播放最终版)
'use client';
import React, { useEffect, useRef } from 'react';

export default function VideoPlayerModal({ video, onClose, onVideoEnded }) {
    const modalRef = useRef(null);
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const modalInstanceRef = useRef(null);
    const hlsInstanceRef = useRef(null);

    useEffect(() => {
        if (!modalRef.current) return;
        modalInstanceRef.current = new window.bootstrap.Modal(modalRef.current);
        const handleHidden = () => {
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
            onClose();
        };
        modalRef.current.addEventListener('hidden.bs.modal', handleHidden);
        return () => {
            if (modalRef.current) modalInstanceRef.current?.removeEventListener('hidden.bs.modal', handleHidden);
            if (modalInstanceRef.current) modalInstanceRef.current.dispose();
        };
    }, [onClose]);

    useEffect(() => {
        const player = videoRef.current;
        if (!player) return;

        let onPlay, onPause, onSeeked, onRateChange, onEnded;
        const cleanupPlayer = () => {
            console.log("Cleanup: 清理播放器实例...");
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

        if (video) {
            cleanupPlayer();
            modalInstanceRef.current?.show();

            const platform = video.platform?.toLowerCase();
            const refererUrl = video.originalPageUrl || video.url;

            // --- 核心修复：直接使用数据库中存储的 video.url ---
            const videoProxyUrl = `/api/proxy?url=${encodeURIComponent(video.url)}&referer=${encodeURIComponent(refererUrl)}`;

            onEnded = () => {
                if (platform === 'bilibili' && onVideoEnded) {
                    onVideoEnded(video.id || video._id);
                }
            };
            player.addEventListener('ended', onEnded);

            if ('mediaSession' in navigator) { /* ... mediaSession 逻辑不变 ... */ }

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
        } else {
            modalInstanceRef.current?.hide();
        }
        return cleanupPlayer;
    }, [video, onVideoEnded]);

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
                            <video
                                ref={videoRef}
                                id="video-player"
                                className="w-100 h-100 bg-black"
                                controls
                                autoPlay
                                crossOrigin="anonymous"
                                poster={posterUrl}
                            ></video>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}