const express = require("express");
const router = express.Router();

const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const rateLimit = require("express-rate-limit");

const cloudinary = require("cloudinary").v2;

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});


router.post("/register", limiter, async (req, res) => {

    try {

        const {
            fullName,
            email,
            password,
            phone,
            address
        } = req.body;

        // Required Fields
        if (!fullName || !email || !password || !phone) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        // Email Validation
        if (!validator.isEmail(email)) {

            return res.status(400).json({
                success: false,
                message: "Invalid Email"
            });

        }

        // Password Validation
        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });

        }

        // Existing User
        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });

        }

        // Image Check
        // if (!req.files || !req.files.profileImage) {

        //     return res.status(400).json({
        //         success: false,
        //         message: "Profile Image Required"
        //     });

        // }

        // // Upload Image
        // const image = req.files.profileImage;

        // const result = await cloudinary.uploader.upload(
        //     image.tempFilePath,
        //     {
        //         folder: "Marketplace/Profile"
        //     }
        // );

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({

            fullName,

            email,

            password: hashedPassword,

            phone,

            address: address || "",

            // profileImage: result.secure_url,

            // profileImageId: result.public_id

        });
        const newUser = await User.findById(user._id).select("-password");


        res.status(201).json({

            success: true,

            message: "Registration Successful. Please Login.",


            user:newUser

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});


// LOGIN

router.post("/login", limiter, async (req, res) => {

    try {

        const { email, password } = req.body;

        // Required Fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        // Email Validation
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email"
            });
        }

        // Find User
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

        // Generate Token
        const token = jwt.sign(

            {   fullName:user.fullName,
                id: user._id,
                 role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );
const userData = await User.findById(user._id).select("-password");
        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user:userData
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// GET PROFILE

router.get("/profile/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});


// UPDATE PROFILE

router.put("/update-profile/:id", async (req, res) => {

    try {

        const { fullName, phone, address } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Update Normal Fields
        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        // Update Profile Image
        if (req.files && req.files.profileImage) {

            // Delete Old Image
            if (user.profileImageId) {

                await cloudinary.uploader.destroy(user.profileImageId);

            }

            // Upload New Image
            const result = await cloudinary.uploader.upload(

                req.files.profileImage.tempFilePath,

                {
                    folder: "Marketplace/Profile"
                }

            );

            user.profileImage = result.secure_url;
            user.profileImageId = result.public_id;

        }

        await user.save();

        res.status(200).json({

            success: true,
            message: "Profile Updated Successfully",
            user

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

});



//CHANGE PASSWORD

router.put("/change-password/:id", async (req, res) => {

    try {

        const {

            oldPassword,

            newPassword

        } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        // Compare Old Password
        const isMatch = await bcrypt.compare(

            oldPassword,

            user.password

        );

        if (!isMatch) {

            return res.status(400).json({

                success: false,

                message: "Old Password is incorrect"

            });

        }

        // Password Length
        if (newPassword.length < 8) {

            return res.status(400).json({

                success: false,

                message: "Password must be at least 8 characters"

            });

        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({

            success: true,

            message: "Password Changed Successfully"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

router.put("/update-role/:id", async (req, res) => {

    try {

        const { role } = req.body.role;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "Role is required"
            });
        }

        const validRoles = ["user", "seller", "admin"];

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Role updated successfully",
            user
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

//Upload Profile Image
router.put('/uploadProfileImage',async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(tokenData.id)

        // console.log("user:",user);

        if (!req.files || !req.files.profileImage) {
            return res.status(500).json({ message: "Profile Image Required" })
        }
        const uploadImage = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath, {
            folder: "Ecommerce/userProfile"
        });
        user.profileImage = uploadImage.secure_url
        user.profileImageId = uploadImage.public_id
        const data = await user.save()
        res.status(200).json({
            message: "Image uploaded",
            data
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: 'something wrong' })

    }
}
)


module.exports = router;