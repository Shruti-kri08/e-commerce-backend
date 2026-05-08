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
            const newWishlist = new Wishlist({
                userId: tokenData.userId,
                productId: [req.params.id]
            })
            const result = await newWishlist.save()
            return res.status(200).json({ Added: result })
        }
        else {
            const isSaved = wishlist.productId.includes(req.params.id)
            if (!isSaved) {
                wishlist.productId.push(req.params.id)

            }
            else {
                wishlist.productId = wishlist.productId.filter((pId) => { pId != req.params.id })

            }
            const result = newWishlist.save()
            return res.status(200).json({ Added: result })
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message
        });
    }

})





module.exports = router