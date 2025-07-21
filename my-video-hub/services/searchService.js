// 文件路径: services/searchService.js (修改后)
import api from './api';

// 接受 keyword 和 source 两个参数
const search = async (keyword, source = 'all') => {
    const response = await api.get('/search', {
        params: { keyword, source } // 将 source 传递给后端
    });
    return response.data;
};

const searchService = {
    search,
};

export default searchService;