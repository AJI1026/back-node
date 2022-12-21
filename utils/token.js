// 实现token, 需要的插件
const jwt = require('jsonwebtoken')
const SECRET = 'aji'

// token校验函数
exports.verToken = function (token) {
    return new Promise((resolve,reject) => {
        const info = jwt.verify(token.split(' ')[1], SECRET)
        resolve(info)
    })
}
