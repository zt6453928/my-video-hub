const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
    let token;

    // 从请求头中获取 token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 请求头格式为 'Bearer TOKEN'，我们只取 TOKEN 部分
            token = req.headers.authorization.split(' ')[1];

            // 验证 token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 从 token 中获取用户ID，并从数据库中查询用户信息（不包括密码）
            // 将用户信息附加到请求对象上，方便后续的路由使用
            req.user = await User.findById(decoded.id).select('-password');

            next(); // 通过检查，进入下一个处理环节
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: '认证失败，token 无效' });
        }
    }

    if (!token) {
        res.status(401).json({ message: '认证失败，未提供 token' });
    }
};

module.exports = { protect };