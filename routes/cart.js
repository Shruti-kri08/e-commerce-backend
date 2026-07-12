require('dotenv').config()
const express=require('express')
const router=express.Router()
const Cart=require('../models//Cart')
const jwt=require('jsonwebtoken')
const Product = require('../models/Product')


router.post('/addToCart/:productId',async(req,res)=>{
    try{
        const token=req.headers.authorization.split(" ")[1]
    const tokenData= jwt.verify(token,process.env.SECRET_KEY)
        const product=await Product.findById(req.params.productId)
        if(!product){
            return res.status(404).json({message:"Product not exist!"})
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
           if( item.productId.toString()===req.params.productId)
           {productExist=true
           item.qty++}
            
        });
        if(!productExist){
            cart.items.push({productId:req.params.productId ,qty:1})

        }
        await cart.save()
        res.status(200).json({cart})

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err})
        
    }
})

router.get('/getCart', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SECRET_KEY);

        const cart = await Cart.findOne({ userId: tokenData.userId })
            .populate("items.productId");

        if (!cart) {
            return res.status(404).json({
                message: "Cart is empty"
            });
        }

        return res.status(200).json({
            cart
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err.message
        });
    }
});


router.put('/increaseQty/:productId', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SECRET_KEY);

        const cart = await Cart.findOne({ userId: tokenData.userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        let productFound = false;

        cart.items.forEach((item) => {
            if (item.productId.toString() === req.params.productId) {
                item.qty++;
                productFound = true;
            }
        });

        if (!productFound) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        await cart.save();

        return res.status(200).json({
            message: "Quantity increased",
            cart
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err.message
        });
    }
});

router.put('/decreaseQty/:productId', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const tokenData = jwt.verify(token, process.env.SECRET_KEY);

        const cart = await Cart.findOne({ userId: tokenData.userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        let productFound = false;

        cart.items = cart.items.filter((item) => {
            if (item.productId.toString() === req.params.productId) {
                productFound = true;

                if (item.qty > 1) {
                    item.qty--;
                    return true;
                }

                return false; 
            }

            return true;
        });

        if (!productFound) {
            return res.status(404).json({
                message: "Product not found in cart"
            });
        }

        await cart.save();

        return res.status(200).json({
            message: "Quantity updated",
            cart
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err.message
        });
    }
});