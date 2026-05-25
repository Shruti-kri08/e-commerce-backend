const mongoose = require('mongoose')
const Product = require('./Product')
const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },

    items: [{
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Project',
        },
        qty: {
            type: Number,
            default: 1,

        }
    }],
    TotalPrice: {
        type: Number,
    }
})
module.exports=mongoose.model('Cart',cartSchema)