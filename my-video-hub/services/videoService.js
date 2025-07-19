import api from './api';

const getVideos = async () => {
    const response = await api.get('/videos');
    return response.data;
};

const addVideo = async (videoData) => {
    const response = await api.post('/videos', videoData);
    return response.data;
};

const updateVideo = async (id, videoData) => {
    const response = await api.put(`/videos/${id}`, videoData);
    return response.data;
};

const deleteVideo = async (id) => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
};

// --- 新增：获取实时播放信息的函数 ---
const getPlayInfo = async (id) => {
    const response = await api.get(`/videos/${id}/play-info`);
    return response.data;
};

const videoService = {
    getVideos,
    addVideo,
    updateVideo,
    deleteVideo,
    getPlayInfo,
};

export default videoService;