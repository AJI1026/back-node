// 导入express
const express = require("express")
// 实例化express.Route为router
const router = express.Router()
// 导入controller 模块
const user = require('../controller/user/user')
// 使用router配置路由
// 用户路由
router.use('/user',user);
// 导出router模块
module.exports = router
