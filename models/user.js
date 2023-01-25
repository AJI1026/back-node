// 建立登录注册模型
// 修改模型，进行加密
const mongoose = require("./connectdb");
let counter = 1
let CountedId = {type: Number, default: () => counter++}
const UserSchema = new mongoose.Schema({
    // 用户ID, 用来对应个人笔记
    userId: CountedId,
    // 用户名
    username: {
        type:String,
        unique:true, // 用户名唯一
    },
    // 密码
    password: {
        type:String,
        // 通过bcryptjs中的hashSync生产hash密码
        set(val) {
            // 通过bcryptjs对密码返回值 第一个值返回值，第二个密码强度
            return require('bcryptjs').hashSync(val,10)
        }
    },
    // 用户头像
    userImg: {
        type:String,
    },
    // 用户好友
    userFriends: {
        type: Array
    },
    // 用户群
    userGroups: {
        type: Array
    }
    // 这里去掉__v字段，__v用来记录版本的
},{versionKey: false})
const User = mongoose.model('User',UserSchema)
module.exports = {User}

User.find({userId: {$gt: 0}}).sort({userId: -1})
    .then(([first, ...others])=> {
        if(first){
            counter = first.userId + 1
        }
    })
