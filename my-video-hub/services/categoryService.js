// 文件路径: services/categoryService.js (新文件)
import api from './api';

const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

const addCategory = async (name) => {
    const response = await api.post('/categories', { name });
    return response.data;
};

const deleteCategory = async (name) => {
    // URL中的特殊字符需要编码
    const response = await api.delete(`/categories/${encodeURIComponent(name)}`);
    return response.data;
};

const categoryService = {
    getCategories,
    addCategory,
    deleteCategory,
};

export default categoryService;