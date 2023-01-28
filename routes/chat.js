// 导入express
const express = require("express")
// 实例化express.Route为router
const router = express.Router()
// 导入controller 模块
const chat = require('../controller/chat/chat')
// 使用router配置路由
// 用户路由
router.use('/chat',chat);
// 导出router模块
module.exports = router
