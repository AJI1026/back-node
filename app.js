// 引入express模块
const express = require('express')
// 创建app对象，通过语法express() 底层原理http模块的createServer
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
// 引入中间件
const bodyParser = require('body-parser')
// 请求体解析中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// 导入routes
const user = require('./routes/user')
// 解决跨域问题
const cors = require('cors')
// 开发环境设置，生产环境需要配置安全的参数
app.use(cors())

// 这里处理不需要token的接口
const vertoken = require('./utils/token')
const { expressjwt } = require("express-jwt");
// 解析token获取用户信息
app.use(function (req, res, next) {
    const token = req.headers['authorization'];
    if(token === undefined) {
        return next();
    } else {
        vertoken.verToken(token).then((data) => {
            req.data = data;
            return next();
        }).catch((error) => {
            return next()
        })
    }
});
// 验证token是否过期并规定哪些路由不用验证
app.use(expressjwt({
    secret: 'aji',
    algorithms: ['HS256']
}).unless({
    path: ['/admin/user/login','/admin/user/register','/admin/user/codeImg']
}));
// 当token失效返回提示信息
app.use(function (err, req, res, next) {
    if(err.status === 401) {
        return res.status(401).send('token过期，请重新登录')
    }
})

//启动服务器监听端口
// app.listen(3000,() => {
//     console.log('http://localhost:3000')
// })
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})
io.on('connection', function (socket) {
    // 每一个连接上来的用户，都会分配一个socket
    console.log("客户端有连接")

    // 监听用户登录
    socket.on('login', data => {
        console.log('用户登录：', data)
    })

    // 给客户端发送消息
    socket.emit("welcome", "欢迎连接socket🍻")

    // socket实例会监听一个特殊函数，关闭连接的函数disconnect
    socket.on('disconnect', function () {
        console.log('用户关闭连接')
    })
})
http.listen(3000, function () {
    console.log('http://localhost:3000')
})

// 使用router配置路由
app.use('/admin',user);

