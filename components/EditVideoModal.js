// 文件路径: components/EditVideoModal.js (全新文件)
'use client';

import React, { useState, useEffect } from 'react';

export default function EditVideoModal({ video, onSave, onClose }) {
    // 使用 state 来管理表单输入的内容
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');

    // 当传入的 video prop 变化时 (即用户点击了不同的编辑按钮)，更新表单的默认值
    useEffect(() => {
        if (video) {
            setTitle(video.title);
            setCategory(video.category || ''); // 如果没有分类，默认为空字符串
        }
    }, [video]);

    const handleSave = () => {
        // 将修改后的数据打包成一个新的 video 对象
        const updatedVideo = {
            ...video,
            title: title,
            category: category.trim() || '未分类' // 如果用户没填，就默认为“未分类”
        };
        onSave(updatedVideo);
    };

    // 如果没有要编辑的视频，就不渲染任何东西
    if (!video) return null;

    return (
        // 使用 Bootstrap 的 Modal 组件
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">编辑视频信息</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
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
                        <div className="mb-3">
                            <label htmlFor="videoCategory" className="form-label">分类</label>
                            <input
                                type="text"
                                className="form-control"
                                id="videoCategory"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="例如：学习, 音乐, 生活"
                            />
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