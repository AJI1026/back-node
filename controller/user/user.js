// 引入express模块
const express = require('express')
const router = express.Router()
// 引入登录用户模型
const { User } = require('../../models/user')
const { Book } = require('../../models/book')
const { Task } = require('../../models/task')
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
    // 生成一个活跃用户的刷新用的token，这里用jwt实现一个双token验证
    const refresh_token = jwt.sign({
        name:String(user.username),
        _id:String(user._id)
    },SECRET,{expiresIn: '48h'})

    res.send({
        user,
        token,
        refresh_token,
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

let pages; // 分页总页数，设置全局变量，跳转页面时获取总页数
// 查询知识分类书籍列表分页
router.get('/knowledgeBook', async (req, res) => {
    let array = []; // 存储当前页 数据的数组
    let pageDataSize = 6; // 当前页 数据量
    let pageNum = (req.query.pageNum ? req.query.pageNum : 1); // 设置默认页数为第一页
    let prePage = pageNum - 1; // 上一页
    let nextPage = 1*pageNum + 1; // 下一页
    if(prePage < 1) {
        prePage = pageNum
    } else if (nextPage > pages) {
        nextPage = pageNum
    }
    const knowledgeBook = await Book.find({
        // 查找IT书籍
        bookType: 'IT'
    })
    let dataCount = knowledgeBook.length; // 数据总数
    pages = Math.ceil(dataCount / pageDataSize); // 最后一页数据不足时为一页
    let num = (pageNum - 1) * pageDataSize; // 跳过数据数量
    let forNum = (dataCount - num) >= 6 ? 6 : (dataCount - num);
    // 把即将跳转的页面的数据存到一个数组里
    for(let i = 0; i < forNum; i++) {
        array[i] = knowledgeBook[num + i]
    }
    // 分页按钮数据
    let pagesData = {
        dataCount: 1*dataCount,
        pages: pages,
        pageNum: pageNum,
        prePage: prePage,
        nextPage: nextPage
    }
    res.send({
        list: array,
        pagesData: pagesData,
        status: '200',
        message: '知识类书籍获取成功'
    })
})

// 收藏书籍
router.post('/knowledgeBook/status', async (req, res) => {
    const data = await Book.findOneAndUpdate({
        bookName: req.body.bookName,
        bookAuthor: req.body.bookAuthor
    },{$set: {'CollectingStatus': !req.body.CollectingStatus}})
    if(data !== null) {
        res.send({ data, status: '200', message: '操作成功'})
    } else {
        res.send({ data, status: '401', message: '请求数据格式错误'})
    }
})

// 任务列表数据查询
router.get('/sort/task', async (req,res) => {
    const TaskData = await Task.find({})
    if(TaskData) {
        res.send({ TaskData, status: '200', message: '查询成功'})
    } else {
        res.send({ TaskData, status: '401', message: '查询失败'})
    }

})

// 任务列表数据修改
router.post('/sort/modify', async (req, res) => {
    const data = await Task.find({
        id: req.body.id
    })
    await Task.findOneAndUpdate({
        id: req.body.id
    }, {$set:{"task": req.body.task, "goal": req.body.goal}})
    res.send({ data, status: '200', message: '修改成功'})
})

// 任务列表数据删除
router.delete('/sort/delete', async (req,res) => {
    await Task.findOneAndDelete({
        id: req.body.id
    })
    res.send({ status: '200', message: '删除成功'})
})

// 任务列表数据添加
router.put('/sort/add', async (req, res) => {
    const have = await Task.findOne({
        task: req.body.task,
        goal: req.body.goal,
    })
    if(have) {
        res.send({ status: '401', message: '任务添加失败'})
    } else {
        await Task.insertMany({
            id: req.body.id,
            task: req.body.task,
            goal: req.body.goal,
            createTime: req.body.createTime
        })
        res.send({ status: '200', message: '添加成功'})
    }
})

module.exports = router
