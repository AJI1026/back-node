// 建立聊天内容数据模型
let mongoose = require('mongoose');
const chatContentSchema = new mongoose.Schema({
    chatName: String,
    chatTime: String,
    chatContent: String
},{versionKey: false})

const ChatContent = mongoose.model('chatContent', chatContentSchema);
module.exports = { ChatContent }
