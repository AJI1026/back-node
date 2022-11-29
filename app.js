// 引入express模块
const express = require('express')
// 创建app对象，通过语法express() 底层原理http模块的createServer
const app = express()
// 导入routes
const user = require('./routes/user')

//路由，语法app.HTTP请求方式(路径，回调函数)
app.get('/',(req,res) => {
    // send是express用来响应数据
    res.send('Hello')
})
// 用户添加
//启动服务器监听端口
app.listen(3000,() => {
    console.log('http://localhost:3000')
})

// 使用router配置路由
app.use('/admin',user);
