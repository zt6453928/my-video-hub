// 文件路径: server/index.js (v1.1 - CORS 加固版)

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const categoryRoutes = require('./routes/categories');
const searchRoutes = require('./routes/search');
const scrapeRoutes = require('./routes/scrape');

dotenv.config();
const app = express();

// --- 核心修改：提供更明确的 CORS 配置 ---
const corsOptions = {
    // 允许您的前端服务器地址访问
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB 连接成功'))
    .catch((err) => console.error('MongoDB 连接失败:', err));

app.get('/', (req, res) => {
    res.send('My Video Hub API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/scrape', scrapeRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`后端服务器运行在 http://localhost:${PORT}`));