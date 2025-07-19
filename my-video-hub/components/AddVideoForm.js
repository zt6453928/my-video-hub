// 文件路径: my-video-hub/components/AddVideoForm.js (调用后端API最终版)
'use client';

import React, { useState } from 'react';
import { DEFAULT_CATEGORY } from '@/lib/constants';

export default function AddVideoForm({
    onVideoAdded,
    onCancel,
    allCategories = [],
    onAddCategory
}) {
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState(DEFAULT_CATEGORY);
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
            // 1. 调用后端的刮取 API
            const scrapeResponse = await fetch('http://localhost:5001/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!scrapeResponse.ok) {
                const errorData = await scrapeResponse.json();
                throw new Error(errorData.message || '抓取视频信息失败');
            }

            const scrapedVideo = await scrapeResponse.json();

            // 2. 处理分类
            const finalCategory = category.trim() || DEFAULT_CATEGORY;
            if (!allCategories.includes(finalCategory)) {
                onAddCategory(finalCategory);
            }

            // 3. 组合最终数据并调用父组件的保存函数
            const videoToSave = {
                ...scrapedVideo,
                category: finalCategory,
            };

            await onVideoAdded(videoToSave);

            setUrl('');
            setCategory(DEFAULT_CATEGORY);

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
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="videoUrl" className="form-label">视频链接</label>
                        <input
                            type="url"
                            id="videoUrl"
                            className={`form-control ${error ? 'is-invalid' : ''}`}
                            placeholder="粘贴B站视频页面链接..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isSubmitting}
                            required
                        />
                        {error && <div className="invalid-feedback d-block">{error}</div>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="videoCategoryInput" className="form-label">选择或创建分类</label>
                        <input
                            className="form-control"
                            list="categoriesDatalist"
                            id="videoCategoryInput"
                            placeholder="输入以搜索或创建新分类..."
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <datalist id="categoriesDatalist">
                            {allCategories.filter(c => c !== '全部' && c !== DEFAULT_CATEGORY).map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>取消</button>
                        <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <span className="ms-2">正在抓取...</span>
                                </>
                            ) : '确认添加'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}