// 文件路径: server/models/Category.js (新文件)
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: true,
        trim: true,
    }
}, {
    timestamps: true,
});

// 确保在同一个用户下，分类名是唯一的
CategorySchema.index({ user: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;