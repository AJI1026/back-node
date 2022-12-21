const mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/aji',{
    useNewUrlParser:true,
    useUnifiedTopology: true
}, function (err) {
    if(err) {
        console.log('aji数据库连接失败');
    }else {
        console.log('aji数据库连接成功');
    }
})
module.exports = mongoose;
