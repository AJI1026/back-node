// 建立任务列表模型
const mongoose = require("./connectdb")
const TaskSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    task: {
        type: String,
    },
    goal: {
        type: String,
    },
    createTime: {
        type: String,
    },
    taskStatus: {
        type: Boolean,
    }
}, {versionKey: false})
const Task = mongoose.model('task', TaskSchema)
module.exports = { Task }
