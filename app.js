require('dotenv').config();
const express = require('express')
const app = express()
const cors = require('cors');
const mongoose = require('mongoose')
const bodyParser=require('body-parser');
const fileUpload = require('express-fileupload');




//import routes
const userRoutes=require('./routes/user')
const productRoutes=require('./routes/product')
const wishlistRoutes=require('./routes/wishlist')


//connect with database
const connectWithDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("connect with DB");
        
    }
    catch (err) {
        console.log(err);

    }
}

const dns = require('dns');
dns.setServers(['8.8.8.8']);
connectWithDatabase()
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(fileUpload(
    {
    
    useTempFiles:true,        
    tempFileDir:'./tmp/'

    }
))


app.use('/user',userRoutes)
app.use('/product',productRoutes)
app.use('/wishlist',wishlistRoutes)



module.exports = app