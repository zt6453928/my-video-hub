// 文件路径: components/CategoryManager.js (新文件)
'use client';

import React, { useState } from 'react';

export default function CategoryManager({ allCategories, onAddCategory, onDeleteCategory, onClose }) {
    const [newCategory, setNewCategory] = useState('');

    const handleAdd = () => {
        const trimmedCategory = newCategory.trim();
        if (trimmedCategory && !allCategories.includes(trimmedCategory)) {
            onAddCategory(trimmedCategory);
            setNewCategory('');
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">管理分类标签</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="输入新分类名称..."
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                            />
                            <button className="btn btn-outline-primary" type="button" onClick={handleAdd}>添加</button>
                        </div>
                        <ul className="list-group">
                            {allCategories.filter(cat => cat !== '全部').map(cat => (
                                <li key={cat} className="list-group-item d-flex justify-content-between align-items-center">
                                    {cat}
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => onDeleteCategory(cat)}
                                        title={`删除分类 "${cat}"`}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {allCategories.length <= 1 && (
                            <p className="text-center text-muted mt-3">还没有任何分类标签。</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>关闭</button>
                    </div>
                </div>
            </div>
        </div>
    );
}