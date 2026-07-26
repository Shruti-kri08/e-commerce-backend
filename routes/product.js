require('dotenv').config();
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Product = require('../models/Product')
const User=require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})


//Upload product
router.post('/upload', async (req, res) => {
  try {
    console.log("run");
    
    const token = req.headers.authorization.split(" ")[1]
    const tokenData = await jwt.verify(token, process.env.JWT_SECRET)
  
    const user=await User.findById(tokenData.id)
console.log(user);


    // console.log('tokenData : ', tokenData,tokenData.role!=="seller",tokenData.role);
    if(user.role!=="seller"){
      return res.status(500).json({message:"You are not allow"})
    }
    const uploadImage = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
      resource_type: 'image',
      folder: 'Product_image'
    })

    const newProduct = new Product({
      product_name: req.body.product_name,
      price: req.body.price,
      title: req.body.title,
      description: req.body.description,
      userId:user._id,
      category: req.body.category,
      imageUrl: uploadImage.secure_url,
      imageId: uploadImage.public_id
    })
   const product= await newProduct.save()
    user.products.push(product._id)
    await user.save()
    res.status(200).json({ message: "product uploaded..!!" ,
      product:product,
      user:user
    })

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err })

  }
})


//get all product
router.get('/all-products', async (req, res) => {
  try {
    const allProducts = await Product.find().select("product_name title description  category price imageUrl userId").populate('userId', 'fullname')
    res.status(200).json({ allProducts: allProducts })
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err })
  }

})

// product by id
router.get('/byId/:id', async (req, res) => {
  try {

    const product = await Product.findById(req.params.id).select("product_name title description  category price imageUrl");
    if (!product) {
      return res.status(500).json({ message: "Product not found" })
    }
    res.status(200).json({
      product: product
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
});

router.get('/byUserId/:id', async (req, res) => {
  try {

    const product = await Product.find({userId:req.params.id}).select("product_name title description  category price imageUrl");
    if (!product) {
      return res.status(500).json({ message: "Product not found" })
    }
    res.status(200).json({
      product: product
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
});


//all-products by category
router.get('/byCategory/:category', async (req, res) => {

  try {

    const allProducts = await Product.find({ category: req.params.category }).select("userId product_name title description  category price imageUrl ")
    res.status(200).json({ allProducts: allProducts })
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err })
  }

})

//update product
// router.put('/update',async(req,res)=>{
//   try{



//   }
//   catch(err){
//     console.log(err);
//     res.status(500).json({ error: err })
//   }
// })

//get latest product
router.get("/latest-products", async (req, res) => {

    try {

        const latestProducts = await Product.find()
            .select("product_name title description category price imageUrl userId")
            .populate("userId", "fullName")
            .sort({ _id: -1 })
            .limit(4);

        res.status(200).json({
            success: true,
            latestProducts
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

//delete product by id(product id)
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]
    const tokendata = await jwt.verify(token, process.env.JWT_SECRET)

    const product = await Product.findById(req.params.id)

    //product not found
    if (!product) {
      return res.status(500).json({ message: "Product not found" })
    }

    //owner check
    if (tokendata.userId != product.userId) {
      return res.status(500).json({ message: "You are not allwoed to delete" })

    }

    //delete image from cloudinary
    await cloudinary.uploader.destroy(product.imageId)

    //delete product
    const data = await Product.findByIdAndDelete(req.params.id).select("product_name title description  category price imageUrl")
    console.log(data);

    res.status(200).json({
      message: "delete successfully",
      deletedProduct: data
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
});


//delete all products by product owner
router.delete('/byUserId/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]
    const tokendata = await jwt.verify(token, process.env.JWT_SECRET)

    if (tokendata.userId !== req.params.userId) {
      return res.status(500).json({ message: "you are not allowed to delete" })
    }

    const products = await Product.find({ userId: req.params.userId })

    //product not found
    if (!products.length) {
      return res.status(500).json({ message: "Product not found" })
    }

    products.forEach(async (p) => {
       const deletedImage=await cloudinary.uploader.destroy(p.imageId)
      console.log(deletedImage);
      

    })
    const deletedProducts = await Product.deleteMany({ userId: req.params.userId })
    res.status(200).json({
      message: "delete successfully",
      deletedProduct: deletedProducts
    });

  }
  catch (err) {
    console.log(err);
    res.satatus(500).json({ error: err })
  }
})



module.exports = router;