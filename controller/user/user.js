// 引入express模块
const express = require('express')
const router = express.Router()
// 引入各数据模型
const { User } = require('../../models/user')
const { Book } = require('../../models/book')
const { Task } = require('../../models/task')
const { Good } = require('../../models/good')
const { Address } = require('../../models/address')
const { Step } = require('../../models/step')
const { Order } = require('../../models/order')
// 支付
const alipaySdk = require('../../utils/alipayUtil')
const AlipayFormData = require('alipay-sdk/lib/form').default
const axios = require('axios')
const request = require('request')
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
router.post('/login',async(req, res) =>{
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
router.get('/codeImg', function (req, res) {
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
router.get('/sort/task', async (req, res) => {
    const TaskData = await Task.find({
        taskStatus: false
    })
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
router.delete('/sort/delete', async (req, res) => {
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
            createTime: req.body.createTime,
            taskStatus: false
        })
        res.send({ status: '200', message: '添加成功'})
    }
})

// 已完成的任务列表
router.get('/sort/completed', async (req, res) => {
    const completedData = await Task.find({
        taskStatus: true
    })
    res.send({ completedData, status: '200', message: '获取成功'})
})

// 改变任务完成状态
router.post('/sort/completedStatus', async (req, res) => {
    await Task.findOneAndUpdate({
        id: req.body.id
    },{$set: {taskStatus: req.body.taskStatus}})
    res.send({ status: '200', message: '操作成功'})
})

// 删除已完成任务
router.delete('/sort/completedDelete', async (req, res) => {
    await Task.findOneAndDelete({
        id: req.body.id,
        task: req.body.task,
        goal: req.body.goal,
        createTime: req.body.createTime,
        taskStatus: req.body.taskStatus
    })
    res.send({ status: '200', message: '操作成功'})
})

// 购物车加商品
router.post('/cart/addGoods', async (req, res) => {
    const data = await Good.findOne({
        bookName: req.body.bookName,
    })
    if(data) {
        await Good.findOneAndUpdate({
            bookName: req.body.bookName,
        }, {$set: {goodsQuantity: req.body.goodsQuantity}})
    } else {
        await Good.insertMany({
            bookName: req.body.bookName,
            CoverImg: req.body.CoverImg,
            bookPrice: req.body.bookPrice,
            goodsQuantity: req.body.goodsQuantity
        })
    }
    res.send({ status: '200', message: '添加成功'})
})

// 起始的购物车列表数据
router.get('/cart/goodsList', async (req, res) => {
    const goodsListData = await Good.find({})
    res.send({ goodsListData, status: '200', message: '数据获取成功'})
})

// 改变商品数量
router.post('/cart/quantityChange', async (req, res) => {
    const data = await Good.find({
        goodsQuantity: 1
    })
    if(data) {
        await Good.findOneAndDelete({
            bookName: req.body.bookName
        })
    } else {
        await Good.findOneAndUpdate({
            bookName: req.body.bookName,
        }, {$set: {goodsQuantity: req.body.goodsQuantity}})
    }
    res.send({ status: '200', message: '改变成功'})
})

// 清空购物车数据
router.delete('/cart/deleteAll', async (req, res) => {
    await Good.deleteMany({})
    res.send({ status: '200', message: '操作成功'})
})

// 地址数据渲染
router.get('/address/addressList', async (req, res) => {
    const addressListData = await Address.find({})
    res.send({ addressListData, status: '200', message: '查询成功'})
})

// 新增地址
router.put('/address/newAddress', async (req, res) => {
    const data = await Address.findOneAndUpdate({
        defaultAddress: true
    }, {$set: {defaultAddress: false}})
    if(data) {
        await Address.insertMany({
            city: req.body.city,
            address: req.body.address,
            defaultAddress: req.body.defaultAddress,
            name: req.body.name,
            mobilePhone: req.body.mobilePhone,
            remark: req.body.remark,
        })
    }
    res.send({ status: '200', message: '添加成功'})
})

// 移除地址
router.delete('/address/deleteAddress', async (req, res) => {
    await Address.findOneAndDelete({
        addressId: req.query.addressId
    })
    res.send({ status: '200', message: '删除成功'})
})

// 修改地址
router.post('/address/changeAddress', async (req, res) => {
    if(req.body.defaultAddress === true) {
        await Address.findOneAndUpdate({
            defaultAddress: true
        }, {$set: {defaultAddress: false}})
    }
    await Address.findOneAndUpdate({
        addressId: req.body.addressId
    }, {$set: {
            city: req.body.city,
            address: req.body.address,
            defaultAddress: req.body.defaultAddress,
            name: req.body.name,
            mobilePhone: req.body.mobilePhone,
            remark: req.body.remark,}})
    res.send({ status: '200', message: '修改成功'})
})

// 移除商品
router.delete('/goods/delete', async (req, res) => {
    await Good.findOneAndDelete({
        bookName: req.body.bookName
    })
    res.send({status: '200', message: '操作成功'})
})

// 获取step值
router.get('/order/step', async (req, res) => {
    const stepData = await Step.find({})
    res.send({stepData, status: '200', message: '获取成功'})
})

// 增加步骤step的值
router.post('/order/addStep', async (req, res) => {
    await Step.findOneAndUpdate({
        step: req.query.step
    },{$set: {step: Number(req.query.step) + 1}})
    res.send({status: '200', message: '操作成功'})
})

// 减少步骤step的值
router.post('/order/decreaseStep', async (req, res) => {
    await Step.findOneAndUpdate({
        step: req.query.step
    },{$set: {step: Number(req.query.step) - 1}})
    res.send({status: '200', message: '操作成功'})
})

// 生成订单
router.put('/order/orderInformation', async (req, res) => {
    await Order.insertMany({
        orderId: req.body.orderId,
        orderGoods: req.body.orderGoods,
        orderStatus: 0
    })
    res.send({ status: '200', message: '操作成功'})
})

// 支付包沙盒支付
router.post('/order/pcPay', async (req, res, next) => {
    // * 添加购物车支付支付宝 */
    // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
    const formData = new AlipayFormData();
    formData.setMethod('get');
    // 通过 addField 增加参数
    // 在用户支付完成之后，支付宝服务器会根据传入的 notify_url，以 POST 请求的形式将支付结果作为参数通知到商户系统。
    formData.addField('returnUrl', 'http://localhost:8080/#/cart/completed'); // 支付成功回调地址，必须为可以直接访问的地址，不能带参数
    formData.addField('bizContent', {
        outTradeNo: req.body.orderId, // 商户订单号,64个字符以内、可包含字母、数字、下划线,且不能重复
        productCode: 'FAST_INSTANT_TRADE_PAY', // 销售产品码，与支付宝签约的产品码名称,仅支持FAST_INSTANT_TRADE_PAY
        totalAmount: 0.01, // 订单总金额，单位为元，精确到小数点后两位
        subject: '商品', // 订单标题
        body: '商品详情', // 订单描述
        timeout_express: '60m', // 超时时间
    });
    // 如果需要支付后跳转到商户界面，可以增加属性"returnUrl"
    const result =  alipaySdk.exec(  // result 为可以跳转到支付链接的 url
        'alipay.trade.page.pay', // 统一收单下单并支付页面接口
        {}, // api 请求的参数（包含“公共请求参数”和“业务参数”）
        { formData: formData },
    );
    result.then((resp) => {
        res.send({
            message: '成功',
            status: 200,
            'result': resp,
        })
    })
})

// 查询支付宝的数据
router.post('/order/payJudge', async (req, res) => {
    let out_trade_no = req.body.out_trade_no
    let trade_no = req.body.trade_no
    // 对接支付宝
    const formData = new AlipayFormData();
    formData.setMethod('get');
    formData.addField('bizContent', {
        out_trade_no,
        trade_no
    });
    const result = alipaySdk.exec(
        'alipay.trade.query',
        {},
        {formData: formData},
    );
    result.then(resData => {
        axios({
            url: resData,
            method: 'GET'
        }).then(data => {
            let r = data.data.alipay_trade_query_response
            if (r.code === '10000') {
                switch (r.trade_status) {
                    case 'WAIT_BUYER_PAY':
                        res.send({
                            success: true,
                            orderStatus: 0,
                            code: 200,
                            msg: '支付宝有交易记录，没付款'
                        })
                        break;
                    case 'TRADE_FINISHED':
                        res.send({
                            success: true,
                            orderStatus: 4,
                            code: 200,
                            msg: '交易完成，不可以退款'
                        })
                        break;
                    case 'TRADE_SUCCESS':
                        res.send({
                            success: true,
                            orderStatus: 2,
                            code: 200,
                            msg: '交易完成，可以退款'
                        })
                        break;
                    case 'TRADE_CLOSED':
                        res.send({
                            success: true,
                            orderStatus: 1,
                            code: 200,
                            msg: '交易关闭'
                        })
                        break;
                }
            }
        }).catch(err => {
            res.json({
                msg: '查询失败',
                err
            })
        })
    })
})

// 修改订单，设置对应的支付宝订单号与订单状态
router.post('/order/status', async (req, res) => {
    await Order.findOneAndUpdate({
        orderId: req.body.orderId
    },{$set: {orderStatus: req.body.orderStatus, tradeNo: req.body.tradeNo}})
    res.send({
        status: 200,
        message: '操作成功'
    })
})

// 清空商品列表数据
router.delete('/order/deleteGoods', async (req, res) => {
    await Good.deleteMany({})
})

module.exports = router

