// 文件路径: components/EditVideoModal.js (v2.2 - 分类选择版)
'use client';

import React, { useState, useEffect } from 'react';
import { DEFAULT_CATEGORY } from '@/lib/constants';

// --- 核心修改：接收 allCategories prop ---
export default function EditVideoModal({ video, onSave, onClose, allCategories }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        if (video) {
            setTitle(video.title);
            setCategory(video.category || DEFAULT_CATEGORY); // 保证有默认值
            setIsPrivate(video.isPrivate || false);
        }
    }, [video]);

    const handleSave = () => {
        const updatedVideo = {
            ...video,
            title: title.trim(),
            category: category, // 直接使用 state 中的 category
            isPrivate: isPrivate,
        };
        onSave(updatedVideo);
    };

    if (!video) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">编辑视频信息</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label htmlFor="videoTitle" className="form-label">标题</label>
                            <input
                                type="text"
                                className="form-control"
                                id="videoTitle"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        {/* --- 核心修改：将输入框改为下拉选择框 --- */}
                        <div className="mb-3">
                            <label htmlFor="videoCategory" className="form-label">分类</label>
                            <select
                                className="form-select"
                                id="videoCategory"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {allCategories.filter(c => c !== '全部').map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-check form-switch mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="isPrivateSwitch"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="isPrivateSwitch">
                                设为私密视频
                            </label>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>保存更改</button>
                    </div>
                </div>
            </div>
        </div>
    );
}