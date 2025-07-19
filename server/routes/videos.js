// 文件路径: server/routes/videos.js (逻辑修复最终版)
const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect } = require('../middleware/authMiddleware');
// --- 核心修复：导入正确的、专用的函数 ---
const { getBilibiliPlayInfo } = require('../scrapers/bilibiliScraper');

// === GET /api/videos (获取所有视频) ===
router.get('/', protect, async (req, res) => {
    try {
        const videos = await Video.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// === POST /api/videos (添加新视频) ===
router.post('/', protect, async (req, res) => {
    try {
        const video = new Video({
            ...req.body,
            user: req.user._id,
        });
        const createdVideo = await video.save();
        res.status(201).json(createdVideo);
    } catch (error) {
        res.status(400).json({ message: '无效的视频数据' });
    }
});

// === PUT /api/videos/:id (更新视频) ===
router.put('/:id', protect, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (video) {
            if (video.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: '无权操作' });
            }
            video.title = req.body.title || video.title;
            video.category = req.body.category || video.category;
            video.isPrivate = req.body.isPrivate;
            const updatedVideo = await video.save();
            res.json(updatedVideo);
        } else {
            res.status(404).json({ message: '视频未找到' });
        }
    } catch (error) {
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// === DELETE /api/videos/:id (删除视频) ===
router.delete('/:id', protect, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (video) {
            if (video.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: '无权操作' });
            }
            await video.deleteOne();
            res.json({ message: '视频已删除' });
        } else {
            res.status(404).json({ message: '视频未找到' });
        }
    } catch (error) {
        res.status(500).json({ message: '服务器内部错误' });
    }
});


module.exports = router;