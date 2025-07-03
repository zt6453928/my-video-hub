// 文件路径: components/AddVideoForm.js (v9.1 - 一体化架构最终版)
'use client';

import React, { useState } from 'react';

export default function AddVideoForm({ onVideoAdded, onCancel }) {
    const [url, setUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!url.trim()) {
            setError('视频链接不能为空！');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            // --- 核心修复：直接调用内部 API 路由 ---
            const apiUrl = '/api/scrape';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '抓取视频信息失败');
            }

            const addedVideo = await response.json();
            onVideoAdded(addedVideo);
            setUrl('');

        } catch (err) {
            console.error("[Add Form] 提交时出错:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card bg-light mb-4">
            <div className="card-body">
                <h5 className="card-title">添加新视频</h5>
                <p className="card-text text-muted small">粘贴视频页面或 M3U8 链接，系统将自动抓取信息。</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                            <input
                                type="url"
                                className={`form-control ${error ? 'is-invalid' : ''}`}
                                placeholder="https://..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isSubmitting}
                                required
                            />
                            {error && <div className="invalid-feedback">{error}</div>}
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>取消</button>
                        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    正在抓取...
                                </>
                            ) : (
                                '确认添加'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}