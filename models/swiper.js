// 建立轮播图模型
const mongoose = require("./connectdb")
const SwiperSchema = new mongoose.Schema({
    swiperType: {
        type: String
    },
    swiperImg: []
}, {versionKey: false})
const Swiper = mongoose.model('swiper', SwiperSchema)
module.exports = { Swiper }
