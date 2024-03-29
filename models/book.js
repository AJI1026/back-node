// 建立分类书籍模型
const mongoose = require("./connectdb")
const BookSchema = new mongoose.Schema({
    _id: {
        type: Number,
    },
    bookType: {
        type: String,
    },
    CoverImg: {
        type: String,
    },
    bookName: {
        type: String,
    },
    bookAuthor: {
        type: String,
    },
    authorIntroduction: {
        type: String,
    },
    bookIntroduction: {
        type: String,
    },
    bookPrice: {
        type: String,
    },
    CollectingStatus: {
        type: Number,
    },
    bookStatus: {
        type: Number,
    },
    bookStore: {
        type: Number,
    },
    bookCode: {
        type: Number,
    },
    bookTime: {
        type: String,
    },
    bookGrade: {
        type: Number,
    },
    detailImg: []
}, {versionKey: false})
const Book = mongoose.model('book', BookSchema)
module.exports = { Book }
