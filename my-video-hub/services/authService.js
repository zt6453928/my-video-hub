// 文件路径: my-video-hub/services/authService.js (v1.1 - 统一API客户端修复版)

// --- 核心修改：我们将使用 api 实例来代替 fetch ---
import api from './api';

const register = async (username, password) => {
    // 使用 axios 实例发送 POST 请求
    const response = await api.post('/auth/register', { username, password });
    return response.data;
};

const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const data = response.data;

    if (data.token) {
        // 登录成功后，将包含 token 的用户信息存入 localStorage
        localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
    return null;
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;