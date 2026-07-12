require('dotenv').config();
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')


//Signup API
router.post('/signup', async (req, res) => {
    try {
        const data = await User.find({ email: req.body.email })

        if (data.length > 0) {
            return res.status(500).json({ msg: "email allready registered" })
        }

        const hash = await bcrypt.hash(req.body.password,8)
        // console.log("hash pass : ", hash);

        const newUser = new User({
            fullname: req.body.fullname,
            email: req.body.email,
            phone: req.body.phone,
            password: hash
        })
        const result = await newUser.save()
        console.log("data saved,new user signuped..!");
        
        // console.log("newUser :", newUser);
        console.log("result ", result)

        return res.status(200).json(
            {
                fullname: req.body.fullname,
                email: req.body.email,
                phone: req.body.phone,
            })

    }
    catch (err) {
         res.status(500).json({
            err: "something is worng",
            error: err
        })
    }


})

//Login API
router.post('/login', async(req, res) => {
   try{
 const data=await User.find({email:req.body.email})
    if(data.length==0){
        return res.status(400).json({msg:"Email not signuped"})
    }

    const check=await bcrypt.compare(req.body.password,data[0].password)
    if(!check){
        return res.status(400).json({msg:"Invalid Password"})
    }

    const token=jwt.sign({
        fullname:data[0].fullname,
        email:data[0].email,
        userId:data[0]._id
    },process.env.SECRET_KEY,{expiresIn:"30d"})


    res.status(200).json({
        fullname:data[0].fullname,
        email:data[0].email,
        userId:data[0]._id,
        token:token
    })

   }
   catch(err){
     console.log(err);
     res.status(500).json({
     
      
            err: "something is worng",
            error: err
        })
   }
})


//get all user
router.get('/allUser',async(req,res)=>{
    try{
        const all_users=await User.find()
    res.status(200).json({
        all_users:all_users
    })

    }
    catch(err){
            res.status(500).json({
            err: "something is worng",
            error: err
        })
    }
})

module.exports = router