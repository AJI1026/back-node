// 建立step模型
const mongoose = require('./connectdb')
const StepSchema = new mongoose.Schema({
    step: {
        type: Number,
        required: true
    }
})
const Step = mongoose.model('step', StepSchema)
module.exports = { Step }
