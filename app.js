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
    path: ['/admin/user/login','/admin/user/register','/admin/user/codeImg', '/admin/user/upload']
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
var userList = [{
    name:'默认群聊',
    img:'https://w.wallhaven.cc/full/jx/wallhaven-jx3gxy.jpg',
    active: true,
}] // 放在外面！！！，不然每次监听连接事件都会刷新没
io.on('connection', function (socket) {
    // 每一个连接上来的用户，都会分配一个socket
    console.log("客户端有连接")
    // 监听用户登录
    socket.on('onSubmit', (data, callback) => {
        // 遍历服务器连接对象
        let isLogin = true;
        // 这里因为版本原因不能直接用io.sockets.sockets去循环，需要用Object.keys
        if(io.sockets.sockets.name === data.name) {
            isLogin = false
        }
        if(isLogin) {
            console.log('用户登录成功：', data);
            userList.push(data);
            io.sockets.sockets.name = data.name;
            callback(true);
            io.emit('login', userList)
        } else {
            console.log('用户登录失败！：', data);
            callback(false);
        }
    })

    // 监听群聊事件
    socket.on('groupChat', data => {
        // 发送给所有客户端，除了发送者（广播）
        data.type = 'friend';
        socket.broadcast.emit('updateChatMessageList', data)
    })

    // 监听私聊事件
    socket.on('privateChat',data=>{
        /* 找到对应的私聊对象 */
        Object.keys(io.sockets.sockets).forEach(iss=>{
            io.to(iss.id).emit('updateChatMessageList',data);
        });
    });


    // 给客户端发送消息
    socket.emit("welcome", "欢迎连接socket🍻")

    // socket实例会监听一个特殊函数，关闭连接的函数disconnect
    socket.on('disconnect', function () {
        // 用户离开后，从列表中删除
        let index = userList.findIndex(i => i.name === io.sockets.sockets.name)
        if(index) {
            userList.splice(index, 1)
            // 通知前端
            io.emit('login', userList)
        }
    })
})
http.listen(3000, function () {
    console.log('localhost:3000')
})

// 使用router配置路由
app.use('/admin',user);

