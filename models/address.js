// 建立购物车内物品模型
const mongoose = require("./connectdb")
let counter = 1
let CountedId = {type: Number, default: () => counter++}
const AddressSchema = new mongoose.Schema({
    addressId: CountedId,
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    defaultAddress: {
        type: Boolean,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mobilePhone: {
        type: Number,
        required: true
    },
    remark: {
        type: Array,
    }
}, {versionKey: false})
const Address = mongoose.model('address', AddressSchema)
module.exports = { Address }

Address.find({addressId: {$gt: 0}}).sort({addressId: -1})
    .then(([first, ...others])=> {
        if(first){
            counter = first.addressId + 1
        }
    })
