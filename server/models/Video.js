const mongoose = require('mongoose');

// 定义视频数据的结构
const VideoSchema = new mongoose.Schema({
    // 让每个视频都与一个用户ID关联起来
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // 建立与 User 模型的关联
    },
    // --- 以下是您原有的视频数据字段 ---
    originalPageUrl: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    audioUrl: {
        type: String, // B站视频需要
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    thumbnailUrl: {
        type: String,
    },
    platform: {
        type: String,
    },
    category: {
        type: String,
        default: '未分类',
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
    tags: [String], // 标签可以是一个字符串数组
}, {
    // 自动为每条数据添加 createdAt 和 updatedAt 时间戳
    timestamps: true,
});

const Video = mongoose.model('Video', VideoSchema);

module.exports = Video;