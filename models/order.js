// 生成订单模型
const mongoose = require('./connectdb')
const OrderSchema = new mongoose.Schema({
    orderId: {
        type: Number,
        required: true,
        unique: true
    },
    orderGoods: {
        type: Array,
        required: true
    },
    // 订单状态 0未付款，1取消，2已付款，3配送中，4已完成
    orderStatus: {
        type: Number,
        required: true
    },
    tradeNo: {
        type: Number,
        unique: true
    }
},{versionKey: false})
const Order = mongoose.model('order', OrderSchema)
module.exports = { Order }
