// 引入express模块
const express = require('express')
const router = express.Router()
// 引入登录用户模型
const {User} = require('../../models/user')
// 引入jwt
const jwt = require('jsonwebtoken')
const SECRET = 'ewgfvwergvwsgw5454gsrgvsvsd'

// 注册接口
router.post('/register',async(req, res) =>{
    const user = await User.create({
        username:req.query.username,
        password:req.query.password
    })
    // 返回出去
    res.send(user)
})
// 登录接口
router.post('/login',async(req,res) =>{
    const user = await User.findOne({
        username:req.query.username
    })
    // 检查是否存在用户名
    if(!user) {
        return res.status(422).send({
            message:"用户不存在"
        })
    }
    // 检查密码是否正确
    const isPasswordValid = require('bcryptjs').compareSync(
        req.query.password,
        user.password
    )
    if(!isPasswordValid){
        return res.status(422).send({
            message:"密码无效"
        })
    }
    // 生成一个一小时的令牌
    const token = jwt.sign({
        id:String(user._id)
    },SECRET,{expiresIn: '1h'})
    // 生成token
    res.send({
        user,
        token
    })
})
// 若用户需要进行一些操作需要先检验是否有token
const auth = async(req,res) => {
    const raw = String(req.headers.authorization).split(' ').pop();
    // 验证
    const {id} = jwt.verify(raw,SECRET)
    req.user = await User.findById(id)
}
module.exports = router
