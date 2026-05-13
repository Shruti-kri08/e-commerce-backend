require('dotenv').config();
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Product = require('../models/Product')
const User = require('../Models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const Wishlist = require('../models/Wishlist');


router.post('/addByProductId/:id', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SECRET_KEY)
        const product = await Product.findById(req.params.id)


        if (!product) {
            return res.status(500).json({ message: "product not found.." })
        }

        const wishlist = await Wishlist.findOne({ userId: tokenData.userId })

        if (!wishlist) {
            //create a wishlist
            const newWishlist = new Wishlist({
                userId: tokenData.userId,
                productId: req.params.id
            })
            const result = await newWishlist.save()
            return res.status(200).json({ saved: result })
        }

        else {
            const isExist = wishlist.productId.includes(req.params.id)
            if (!isExist) {
                wishlist.productId.push(req.params.id)
                const result = await wishlist.save()
                return res.status(200).json({ saved: result })

            }
            else {
                wishlist.productId = wishlist.productId.filter(uId => {
                    uId != req.params.id
                })
                const result = await wishlist.save()
                return res.status(200).json({ unsaved: result })
            }
        }
        // const wishlist = await Wishlist.findOne({ userId: tokenData.userId })

        // if (!wishlist) {
        //     const newWishlist = new Wishlist({
        //         userId: tokenData.userId,
        //         productId: [req.params.id]
        //     })
        //     const result = await newWishlist.save()
        //     return res.status(200).json({ Added: result })
        // }
        // else {

        //     const isSaved = Wishlist.productId.includes(req.params.id)
        //     if (!isSaved) {
        //         wishlist.productId.push(req.params.id)

        //     }
        //     else {
        //         wishlist.productId = wishlist.productId.filter((pId) => { pId != req.params.id })

        //     }
        //     const result = wishlist.save()
        //     return res.status(200).json({ Added: result })
        // }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });
    }

})

//get all products from wishlist
router.get('/savedProduct', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SECRET_KEY)
        const wishlist = await Wishlist.findOne({ userId: tokenData.userId }).populate('productId', 'product_name title  description price category imageUrl')
        if (!wishlist) {
            return res(500).json({ message: "No product are saved in wishlist" })
        }
        res.status(200).json({ wishlist_products: wishlist.productId })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });

    }

})

//get all saved product by category
router.get('/savedProductByCategory/:category', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.SECRET_KEY)
        const wishlist = await Wishlist.findOne({ userId: tokenData.userId }).populate('productId', 'product_name title  description price category imageUrl')
        if (!wishlist) {
            return res(500).json({ message: "No product are saved in wishlist" })
        }
        const products=[]
         products=wishlist.productId.forEach(c=>{
           if( c.category==req.params.category){
            products.push({
                product_name:c.product_name,
                title:c.title,
                description:c.title,
                price:c.price,
                category:c.category,
                imageUrl:c.imageUrl

            }) 
         
           }

           if(products.length==0){
             return res.status(500).json( {message: "No product found for this category"})
           }
           res.status(200).json({products})

        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });
    }
})


module.exports = router