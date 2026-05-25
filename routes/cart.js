require('dotenv').config()
const express=require('express')
const router=express.Router()
const Cart=require('../models//Cart')
const jwt=require('jsonwebtoken')
const Product = require('../models/Product')


router.post('/addToCart/:productId',async(req,res)=>{
    try{
        const token=req.headers.authorization.split(" ")[1]
    const tokenData=await jwt.verify(token,process.env.SECRET_KEY)
        const product=await Product.findById(req.params.productId)
        if(!product){
            return res.status(500).json({message:"Product not exist!"})
        }
        const cart=await Cart.findOne({userId:tokenData.userId})
        if(!cart){

            const newCart=new Cart({
                userId : tokenData.userId,
                items:[{productId:req.params.productId,qty:1}]

            })
           const result= await newCart.save()
            return res.status(200).json({cart:result})
        }
       var productExist=false;
        cart.items.forEach(item => {
           if( item.productId.toString()==req.params.productId)
           {productExist=true
           item.qty++}
            
        });
        if(productExist==flase){
            cart.items.push({productId:req.params.productId ,qty=1})

        }
        await cart.save()
        res.status(200).json({cart})

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err})
        
    }
})

