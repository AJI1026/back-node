// 建立购物车内物品模型
const mongoose = require("./connectdb")
const GoodSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true
    },
    CoverImg: {
        type: String,
        required: true
    },
    bookPrice: {
        type: String,
        required: true
    },
    goodsQuantity: {
        type: Number,
        required: true
    },
}, {versionKey: false})
const Good = mongoose.model('good', GoodSchema)
module.exports = { Good }
