// 建立地址模型
const mongoose = require("./connectdb")
let counter = 1
let CountedId = {type: Number, default: () => counter++}
const AddressSchema = new mongoose.Schema({
    addressId: CountedId,
    city: {
        type: String,
    },
    address: {
        type: String,
    },
    defaultAddress: {
        type: Boolean,
    },
    name: {
        type: String,
    },
    mobilePhone: {
        type: Number,
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
