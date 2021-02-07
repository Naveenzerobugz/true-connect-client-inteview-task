// Creating book schema
var ObjectId = require('mongodb').ObjectID;
var schema = new mongoose.Schema({

    name: {
        type: String
    },
    description: {
        type: String
    },
    amount: {
        type: Number
    },
    sellingprice: {
        type: Number
    },
    stock: {
        type: Number,
    },
    image: {
        type: ObjectId
    },
    createdat: {
        type: Date,
        default: Date.now()
    },
    updatedat: {
        type: Date,
        default: Date.now()
    },
    isdeleted: {
        type: Number,
        default: 0
    },

})


var productdetail = new mongoose.model('productdetail', schema);

module.exports = productdetail;