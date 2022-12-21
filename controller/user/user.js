// 引入express模块
const express = require('express')
const router = express.Router()
// 引入登录用户模型
const { User } = require('../../models/user')
const { Book } = require('../../models/book')
// 引入svg-captcha
const svgCaptcha = require('svg-captcha')
// 读文件
const fs = require('fs')
// 实现token, 需要的插件
const jwt = require('jsonwebtoken')
const SECRET = 'aji'

// 注册接口
router.post('/register',async(req, res) =>{
    // 在数据库库中录入数据
    const {username, password} = req.body
    if(username && password) {
        const user = await User.create({
            username:req.body.username,
            password:req.body.password
        },(err, user) => {
            if(err) {
                res.send({
                    status:'422',
                    message: '注册失败，请检查格式是否正确'
                })
            }else {
                // 生成一个一小时的令牌
                const token = jwt.sign({
                    id:String(user._id)
                },SECRET,{expiresIn: '1h'})
                // 生成token
                // 返回出去
                res.send({
                    status: '200',
                    message: '注册成功',
                    data: user,
                    token
                })
            }
        })
    } else {
        res.send({
            status: '422',
            message: '语义错误'
        })
    }
})

// 登录接口
router.post('/login',async(req,res) =>{
    const user = await User.findOne({
        username:req.body.username,
    })
    // 检查是否存在用户名
    if(!user) {
        return res.status(422).send({
            message:"用户不存在"
        })
    }
    // 检查密码是否正确
    const isPasswordValid = require('bcryptjs').compareSync(
        req.body.password,
        user.password
    )
    if(!isPasswordValid){
        return res.status(422).send({
            message:"密码无效"
        })
    }
    // 生成一个一小时的令牌
    const token = jwt.sign({
        name:String(user.username),
        _id:String(user._id)
    },SECRET,{expiresIn: '1h'})
    // 生成token
    res.send({
        user,
        token,
        status: '200',
        message: '登录成功'
    })
})

// 验证码接口
router.get('/codeImg', function (req,res) {
    const codeConfig = {
        size: 4, // 验证码长度
        ignoreChars: '0o1i', // 验证码排除0o1i
        noise: 5, // 干扰线条的数量
        width: 95,
        height: 40,
        color: true, // 开启文字颜色
        background: '#cc9966', // 背景色
        inverse: false,
        fontSize: 40,
    }
    const captcha = svgCaptcha.create(codeConfig)
    // 存session用于验证接口获取文字码
    // req.session.captcha = captcha.text.toLowerCase()
    // console.log(req.session.captcha)
    const codeData = {
        captchaImg: captcha.data,
        captchaId: captcha.text
    }
    res.type('svg')
    res.status(200).send(codeData)
})

// 查询书籍简介列表
router.get('/simpleBookList', async (req, res) => {
    fs.readFile('./controller/user/books.json', 'utf8', (err, data) => {
        if(err) {
            console.log(err)
        } else {
            res.send({status: 200, message: '获取图书成功', data: JSON.parse(data)})
        }
    })
})

// 查询知识分类书籍列表
router.get('/knowledgeBook', async (req, res) => {
    const knowledgeBook = await Book.find({
        // 查找IT书籍
        id: 1
    })
    res.send({
        knowledgeBook,
        status: '200',
        message: '知识类书籍获取成功'
    })
})


module.exports = router
