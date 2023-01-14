// 建立购物车内物品模型
const mongoose = require("./connectdb")
const GoodSchema = new mongoose.Schema({
    bookName: {
        type: String,
    },
    CoverImg: {
        type: String,
    },
    bookPrice: {
        type: String,
    },
    goodsQuantity: {
        type: Number,
    },
}, {versionKey: false})
const Good = mongoose.model('good', GoodSchema)
module.exports = { Good }
