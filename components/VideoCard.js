// 文件路径: components/VideoCard.js (v6.1 - 前后端分离修复版)
'use client';

import React from 'react';

export default function VideoCard({ video, onClick, onDelete, onEdit }) {

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (window.confirm(`您确定要删除视频 "${video.title}" 吗？`)) {
            onDelete(video.id);
        }
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(video);
    };

    // --- 核心修复：从环境变量中读取 API 地址 ---
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const thumbnailUrl = video.thumbnailUrl
        ? `${apiUrl}/proxy?url=${encodeURIComponent(video.thumbnailUrl)}&referer=${encodeURIComponent(video.originalPageUrl || video.url)}`
        : 'https://placehold.co/600x400/343a40/ffffff?text=无封面';

    return (
        <div className="col">
            <div className="card h-100 shadow-sm position-relative" onClick={() => onClick(video)} style={{ cursor: 'pointer' }}>

                {/* --- 按钮组 --- */}
                <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 10 }}>
                    <button
                        onClick={handleEditClick}
                        className="btn btn-light btn-sm me-1"
                        title="编辑视频"
                    >
                        <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="btn btn-danger btn-sm"
                        title="删除视频"
                    >
                        <i className="bi bi-trash-fill"></i>
                    </button>
                </div>

                <div className="ratio ratio-16x9">
                    <img
                        src={thumbnailUrl}
                        className="card-img-top"
                        alt={video.title}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src='https://placehold.co/600x400/343a40/ffffff?text=加载失败';
                        }}
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-truncate" title={video.title}>
                        {video.title}
                    </h5>
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2 text-muted small">
                        <span className="badge bg-info text-dark">{video.category || '未分类'}</span>
                        <span className={`text-capitalize`}><i className="bi bi-play-circle-fill me-1"></i>{video.platform}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}