// 建立任务列表模型
const mongoose = require("./connectdb")
const TaskSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    task: {
        type: String,
        required: true
    },
    goal: {
        type: String,
        required: true
    },
    createTime: {
        type: String,
        required: true
    },
    taskStatus: {
        type: Boolean,
        required: true
    }
}, {versionKey: false})
const Task = mongoose.model('task', TaskSchema)
module.exports = { Task }
