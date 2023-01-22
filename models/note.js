// 笔记数据模型
const mongoose = require('./connectdb')
let counter = 1
let CountedId = {type: Number, default: () => counter++}
const NoteSchema = new mongoose.Schema({
    noteId: CountedId,
    noteTag: {
        type: String,
        required: true
    },
    noteContent: {
        type: String,
    },
    noteCoverImg: {
        type: String,
    },
    noteCreateTime: {
        type: String,
    }
},{versionKey: false})
const Note = mongoose.model('note', NoteSchema)
module.exports = { Note }

Note.find({noteId: {$gt: 0}}).sort({noteId: -1})
    .then(([first, ...others])=> {
        if(first){
            counter = first.noteId + 1
        }
    })


