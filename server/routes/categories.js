// 文件路径: server/routes/categories.js (新文件)
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Video = require('../models/Video');
const { protect } = require('../middleware/authMiddleware');

// 获取当前用户的所有分类
router.get('/', protect, async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user._id });
        res.json(categories.map(c => c.name));
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 添加新分类
router.post('/', protect, async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: '分类名称不能为空' });
    }
    try {
        const categoryExists = await Category.findOne({ user: req.user._id, name });
        if (categoryExists) {
            return res.status(400).json({ message: '该分类已存在' });
        }
        const category = new Category({ name, user: req.user._id });
        await category.save();
        res.status(201).json(category.name);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 删除分类
router.delete('/:name', protect, async (req, res) => {
    const categoryName = decodeURIComponent(req.params.name);
    try {
        // 更新属于该分类的所有视频，将其分类设为“未分类”
        await Video.updateMany(
            { user: req.user._id, category: categoryName },
            { $set: { category: '未分类' } }
        );
        // 删除该分类
        await Category.deleteOne({ user: req.user._id, name: categoryName });
        res.json({ message: '分类已删除' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;