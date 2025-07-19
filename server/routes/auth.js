const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 辅助函数：根据用户ID生成一个JWT
const generateToken = (id) => {
    // 使用环境变量中的密钥进行签名，有效期设置为30天
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// === API 端点: POST /api/auth/register (用户注册) ===
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            // 如果用户名已存在，返回400错误
            return res.status(400).json({ message: '用户名已存在' });
        }

        const user = await User.create({
            username,
            password,
        });

        if (user) {
            // 注册成功，返回用户信息和 token
            res.status(201).json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: '无效的用户数据' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// === API 端点: POST /api/auth/login (用户登录) ===
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        // 检查用户是否存在，并且输入的密码是否与数据库中的匹配
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            // 认证失败，返回401错误
            res.status(401).json({ message: '无效的用户名或密码' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;