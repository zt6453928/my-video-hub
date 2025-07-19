const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 定义用户数据的结构
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '请输入用户名'],
        unique: true, // 用户名必须是唯一的
        trim: true,
    },
    password: {
        type: String,
        required: [true, '请输入密码'],
        minlength: 6, // 密码最短6位
    },
});

// mongoose 的一个强大功能：在数据被保存到数据库'之前'执行一个钩子函数
UserSchema.pre('save', async function(next) {
    // 如果密码字段没有被修改（例如，只是在更新用户名），则跳过加密过程
    if (!this.isModified('password')) {
        next();
    }
    // "加盐"并哈希密码，10是哈希的强度，数值越大越安全但越耗时
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 在 User 模型上添加一个自定义方法，用于在登录时比较输入的密码和数据库中存储的哈希密码
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// 根据我们定义的结构，创建一个名为 'User' 的模型
const User = mongoose.model('User', UserSchema);

module.exports = User;