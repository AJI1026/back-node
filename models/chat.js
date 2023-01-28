// 建立聊天数据模型
let mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
    // 组员
    groupPeople: String,
    // 时间
    groupTime: String
},{versionKey: false})

const Chat = mongoose.model('chat', chatSchema);
module.exports = { Chat }
