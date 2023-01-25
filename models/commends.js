// 评论数据模型
const mongoose = require('./connectdb')
const CommendSchema = new mongoose.Schema({
    myName: {
        type: String,
        required: true,
    },
    myImg: {
        type: String,
        required: true,
    },
    myCommend: {
        type: String,
        required: true,
    },
    myCommendTime: {
        type: String,
        required: true,
    }
},{versionKey: false})

const Commend = mongoose.model('commend', CommendSchema)
module.exports = { Commend }
