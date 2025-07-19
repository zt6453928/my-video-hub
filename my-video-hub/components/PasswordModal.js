// 文件路径: components/PasswordModal.js (v1.3 - 终极稳定与调试版)
'use client';

import React, { useState, useEffect, useRef } from 'react';

// 一个简单的哈希函数
async function simpleHash(str) {
    if (!str) return '';
    try {
        const buffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error("哈希计算失败:", error);
        return '';
    }
}

export default function PasswordModal({ mode, onCorrectPassword, onClose, onPasswordSet }) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] =useState('');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRef = useRef(null);

    const isSetupMode = mode === 'setup';

    useEffect(() => {
        // 自动聚焦
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[PasswordModal] 表单提交事件触发。');
        setIsVerifying(true);
        setError('');

        try {
            if (isSetupMode) {
                console.log('[PasswordModal] 进入设置密码模式...');
                if (pin.length !== 4) {
                    setError('请输入一个4位数的PIN码');
                    return;
                }
                if (pin !== confirmPin) {
                    setError('两次输入的PIN码不一致');
                    return;
                }
                const hashedPin = await simpleHash(pin);
                console.log('[PasswordModal] PIN码哈希计算完成，准备调用 onPasswordSet。');
                onPasswordSet(hashedPin); // 将哈希值传递给父组件

            } else {
                console.log('[PasswordModal] 进入验证密码模式...');
                const storedHash = localStorage.getItem('private_zone_hash');
                if (!storedHash) {
                    setError('内部错误：未找到已存储的密码。请关闭后重新设置。');
                    return;
                }
                const inputHash = await simpleHash(pin);
                if (inputHash === storedHash) {
                    console.log('[PasswordModal] 密码验证成功，调用 onCorrectPassword。');
                    onCorrectPassword();
                } else {
                    setError('PIN码错误');
                    setPin('');
                    inputRef.current?.focus();
                }
            }
        } catch (err) {
            console.error('[PasswordModal] 处理提交时发生错误:', err);
            setError('发生了一个意外的错误。');
        } finally {
            setIsVerifying(false);
        }
    };

    const title = isSetupMode ? '设置私密空间PIN码' : '进入私密空间';

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '350px' }}>
                <form onSubmit={handleSubmit} className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {!isSetupMode && <p className="text-muted text-center small">请输入4位数PIN码以解锁</p>}
                        <div className="mb-3">
                            <input
                                ref={inputRef}
                                type="password"
                                className={`form-control form-control-lg text-center ${error ? 'is-invalid' : ''}`}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                                maxLength="4"
                                inputMode="numeric"
                                autoComplete="new-password"
                                placeholder="----"
                                style={{ letterSpacing: '0.5em' }}
                            />
                        </div>
                        {isSetupMode && (
                            <div className="mb-3">
                                <label htmlFor="pinConfirmInput" className="form-label visually-hidden">确认PIN码</label>
                                <input
                                    type="password"
                                    className={`form-control form-control-lg text-center ${error ? 'is-invalid' : ''}`}
                                    id="pinConfirmInput"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                                    maxLength="4"
                                    inputMode="numeric"
                                    autoComplete="new-password"
                                    placeholder="确认PIN码"
                                    style={{ letterSpacing: '0.5em' }}
                                />
                            </div>
                        )}
                         {error && <div className="text-danger text-center small mt-2">{error}</div>}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
                        <button type="submit" className="btn btn-primary" disabled={isVerifying || (isSetupMode && pin.length < 4)}>
                            {isVerifying ? '处理中...' : (isSetupMode ? '确认设置' : '解锁')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}