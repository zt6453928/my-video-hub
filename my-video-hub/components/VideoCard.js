'use client';

import React from 'react';
import Image from 'next/image';
import { DEFAULT_CATEGORY, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE_ERROR } from '@/lib/constants';

export default function VideoCard({
    video,
    onClick,
    onDelete,
    onEdit,
    onAdd,
    isAdding,
    isAdded,
    variant = 'default'
}) {

    let thumbnailUrl = video.thumbnailUrl || PLACEHOLDER_IMAGE;
    if (thumbnailUrl.startsWith('//')) {
        thumbnailUrl = 'https:' + thumbnailUrl;
    }
    thumbnailUrl = thumbnailUrl.split('@')[0];

    const handleKeyDown = (e) => {
        if (variant === 'default' && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(video);
        }
    };

    return (
        <div className="col">
            <div
                className="card h-100 shadow-sm position-relative"
                onClick={() => variant === 'default' && onClick(video)}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={variant === 'default' ? 0 : -1}
                style={{ cursor: variant === 'default' ? 'pointer' : 'default' }}
                aria-label={`视频: ${video.title}`}
            >
                <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 10 }}>
                    {variant === 'default' ? (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(video); }} className="btn btn-light btn-sm me-1" title="编辑">
                                <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(video._id); }} className="btn btn-danger btn-sm" title="删除">
                                <i className="bi bi-trash-fill"></i>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onAdd(video)}
                            className={`btn btn-sm ${isAdded ? 'btn-success' : 'btn-primary'}`}
                            title={isAdded ? "已添加" : "添加到我的收藏"}
                            disabled={isAdding || isAdded}
                        >
                            {isAdding ? <span className="spinner-border spinner-border-sm"></span> : (isAdded ? <i className="bi bi-check-lg"></i> : <i className="bi bi-plus-lg"></i>)}
                        </button>
                    )}
                </div>

                <div className="ratio ratio-16x9">
                    <Image
                        src={thumbnailUrl}
                        alt={video.title}
                        fill
                        sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
                        className="card-img-top"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PLACEHOLDER_IMAGE_ERROR;
                        }}
                        style={{ objectFit: 'cover' }}
                    />

                    {/* --- 新增：在右下角显示视频时长 --- */}
                    {video.duration && (
                        <span
                            className="position-absolute bottom-0 end-0 bg-dark text-white small rounded m-1 px-1"
                            style={{ opacity: 0.8 }}
                        >
                            {video.duration}
                        </span>
                    )}
                </div>
                <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-truncate" title={video.title}>
                        <a href={video.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{video.title}</a>
                    </h5>
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2 text-muted small">
                        <span className="badge bg-info text-dark">{video.category || video.author || '未知'}</span>
                        <span className={`text-capitalize`}><i className="bi bi-play-circle-fill me-1"></i>{video.platform}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}