// 笔记数据模型
const mongoose = require('./connectdb')
let counter = 1
let CountedId = {type: Number, default: () => counter++}
const NoteSchema = new mongoose.Schema({
    noteId: CountedId,
    noteUserId: {
        type: Number,
        required: true
    },
    noteTag: {
        type: String,
        required: true
    },
    noteContent: {
        type: String,
        required: true
    },
    noteCoverImg: {
        type: String,
    },
    noteCreateTime: {
        type: String,
    },
    noteReading: {
        type: Number,
    },
    noteCommends: {
        type: Array
    },
},{versionKey: false})
const Note = mongoose.model('note', NoteSchema)
module.exports = { Note }

Note.find({noteId: {$gt: 0}}).sort({noteId: -1})
    .then(([first, ...others])=> {
        if(first){
            counter = first.noteId + 1
        }
    })


