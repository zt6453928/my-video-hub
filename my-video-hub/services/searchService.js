// 文件路径: services/searchService.js (新文件)
import api from './api';

const search = async (keyword) => {
    const response = await api.get('/search', {
        params: { keyword }
    });
    return response.data;
};

const searchService = {
    search,
};

export default searchService;