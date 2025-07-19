// 文件路径: components/Login.js (v1.1 - 错误处理增强版)
'use client';
import { useState } from 'react';
import authService from '@/services/authService';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = isRegistering
                ? await authService.register(username, password)
                : await authService.login(username, password);

            if (data.token) {
                onLoginSuccess();
            } else {
                // --- 核心修改：优先显示后端返回的错误信息 ---
                setError(data.message || '操作失败，请重试');
            }
        } catch (err) {
            // --- 核心修改：处理网络错误或服务器500错误 ---
            console.error("认证失败:", err);
            // 尝试从错误响应中获取更具体的信息
            const message = err.response?.data?.message || '发生网络错误，请稍后再试';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body p-4">
                    <h3 className="card-title text-center mb-4">{isRegistering ? '注册新账号' : '登录 My Video Hub'}</h3>
                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">用户名</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password">密码 (至少6位)</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                                {isLoading ? '处理中...' : (isRegistering ? '注册' : '登录')}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-3">
                        <button className="btn btn-link" onClick={() => setIsRegistering(!isRegistering)} disabled={isLoading}>
                            {isRegistering ? '已有账号？前往登录' : '没有账号？立即注册'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}