// 建立分类书籍模型
const mongoose = require("./connectdb")
const BookSchema = new mongoose.Schema({
    _id: {
        type: Number,
        require: true,
    },
    bookType: {
        type: String,
        require: true,
    },
    CoverImg: {
        type: String,
        require: true,
    },
    bookName: {
        type: String,
        require: true,
    },
    bookAuthor: {
        type: String,
        require: true,
    },
    authorIntroduction: {
        type: String,
        require: true,
    },
    bookIntroduction: {
        type: String,
        required: true
    },
    bookPrice: {
        type: String,
        required: true
    },
    CollectingStatus: {
        type: Number,
        required: true
    },
    bookStatus: {
        type: Number,
        required: true
    },
    detailImg: []
}, {versionKey: false})
const Book = mongoose.model('book', BookSchema)
module.exports = { Book }
