// 引入express模块
const express = require('express')
const router = express.Router()

const fs = require('fs')

// 书籍简介列表
router.get('/simpleBookList', async (req, res) => {
    fs.readFile('./controller/book/books.json', 'utf8', (err, data) => {
        if(err) {
            console.log(err)
        } else {
            res.send({status: 200, message: '获取图书成功', data: JSON.parse(data)})
        }
    })
})


// 添加图书接口
// 接收查询字符串格式请求体
// true可解析嵌套对象，false时采用querystring模块无法解析嵌套对象
router.use(express.urlencoded({extended: true}))
router.post('/addBook', async (req, res) => {
    // 先获取数据
    fs.readFile('./controller/book/books.json', 'utf-8', (err, data) => {
        if(err) {
            console.log(err)
        }
        // 然后把数据转换成数组
        data = JSON.parse(data)
        // 已经设置express.urlencoded，可以直接用req.query来获取前端传进来的参数
        // 获取到的参数是多个数据的数组，所以需要用...展开运算符，不然无法识别
        // Date.now()是从1970年一月一日到现在的时间戳
        data.push({...req.body, id: Date.now()})

        // writeFile是创建文件，如果没有这个文件名会增加新的，已经有这个文件会直接覆盖，目的就是为了把新增的数据的文件覆盖掉之前的
        fs.writeFile('./controller/book/books.json', JSON.stringify(data),(err) => {
            if(err) {
                console.log(err)
            }
            res.send({status: 200, message: '添加图书成功'})
        })
    })
})

module.exports = router
