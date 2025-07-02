// 文件路径: components/VideoPlayerModal.js (v6.13 - 状态重置终极版)
'use client';

import React, { useEffect, useRef } from 'react';

export default function VideoPlayerModal({ video, onClose }) {
    const modalRef = useRef(null);
    const videoRef = useRef(null);
    const modalInstanceRef = useRef(null);
    const hlsInstanceRef = useRef(null);
    const audioInstanceRef = useRef(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // 效果 1: 负责 Modal 的创建和基础事件绑定
    useEffect(() => {
        if (!modalRef.current) return;
        // 初始化 Modal 实例并存储
        modalInstanceRef.current = new window.bootstrap.Modal(modalRef.current);

        // 定义当 Modal 完全隐藏后要执行的清理工作
        const handleHidden = () => {
            onClose(); // 通知父组件关闭已完成
        };
        modalRef.current.addEventListener('hidden.bs.modal', handleHidden);

        // 组件卸载时，销毁 Modal 实例并移除监听器
        return () => {
            if (modalRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                modalRef.current.removeEventListener('hidden.bs.modal', handleHidden);
            }
            if (modalInstanceRef.current) {
                modalInstanceRef.current.dispose();
            }
        };
    }, [onClose]); // 这个 effect 只在组件挂载和卸载时运行

    // 效果 2: 负责根据 video prop 的变化来显示/隐藏 Modal 和管理播放器
    useEffect(() => {
        const player = videoRef.current;

        // --- 核心修复：定义一个统一的、彻底的清理函数 ---
        const cleanupPlayer = () => {
            console.log("Cleanup: 正在清理所有播放器实例...");
            // 销毁 HLS 实例
            if (hlsInstanceRef.current) {
                hlsInstanceRef.current.destroy();
                hlsInstanceRef.current = null;
            }
            // 销毁 Bilibili 的音频实例
            if (audioInstanceRef.current) {
                audioInstanceRef.current.pause();
                audioInstanceRef.current.src = '';
                audioInstanceRef.current = null;
            }
            // 重置 video 元素本身
            if (player) {
                player.pause();
                player.removeAttribute('src');
                player.load();
            }
        };

        if (video && player && apiUrl) {
            // 在设置新视频之前，先执行清理
            cleanupPlayer();

            // 显示 Modal
            modalInstanceRef.current?.show();

            const platform = video.platform.toLowerCase();
            const refererUrl = video.originalPageUrl || video.url;
            const videoProxyUrl = `${apiUrl}/proxy?url=${encodeURIComponent(video.url)}&referer=${encodeURIComponent(refererUrl)}`;

            if (platform === 'bilibili' && video.audioUrl) {
                const audioProxyUrl = `${apiUrl}/proxy?url=${encodeURIComponent(video.audioUrl)}&referer=${encodeURIComponent(refererUrl)}`;
                player.src = videoProxyUrl;
                const audio = new Audio(audioProxyUrl);
                audioInstanceRef.current = audio;
                audio.crossOrigin = "anonymous";

                const onPlay = () => { if (audio.paused) audio.play(); };
                const onPause = () => audio.pause();
                const onSeeking = () => { if (Math.abs(player.currentTime - audio.currentTime) > 0.5) audio.currentTime = player.currentTime; };

                player.addEventListener('play', onPlay);
                player.addEventListener('pause', onPause);
                player.addEventListener('seeking', onSeeking);

            } else if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls();
                hlsInstanceRef.current = hls;
                hls.loadSource(videoProxyUrl);
                hls.attachMedia(player);
            } else {
                player.src = videoProxyUrl;
            }
        } else {
            // 如果 video prop 变为 null，则隐藏 Modal 并执行清理
            modalInstanceRef.current?.hide();
            cleanupPlayer();
        }
    }, [video, apiUrl]);

    // 如果没有要播放的视频，就不渲染任何东西
    if (!video) return null;

    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content bg-dark text-white">
                    <div className="modal-header border-secondary">
                        <h5 className="modal-title text-truncate">{video.title}</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-0">
                        <div className="ratio ratio-16x9">
                            <video ref={videoRef} id="video-player" className="w-100 h-100 bg-black" controls autoPlay crossOrigin="anonymous"></video>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
