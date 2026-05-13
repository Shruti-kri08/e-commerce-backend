const mongoose=require('mongoose')
const wishlistSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },

    productId:[
        {type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Product'
    }
    ]
},
{
    timestamps:true
})

module.exports=mongoose.model('wishlist',wishlistSchema)