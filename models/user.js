// 建立登录注册模型
// 修改模型，进行加密
const mongoose = require("./connectdb");
const UserSchema = new mongoose.Schema({
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
    // 这里去掉__v字段，__v用来记录版本的
},{versionKey: false})
const User = mongoose.model('User',UserSchema)
module.exports = {User}
