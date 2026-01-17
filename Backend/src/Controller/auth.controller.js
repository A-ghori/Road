const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// Register Controller for User
const registerUser = async (req, res)=> {
const {fullName, email, password, phone,adress} = req.body;

try {
    const isUserAlreadyRegister = await userModel.findOne({
        email,
        // password: password
    })
    if(isUserAlreadyRegister){
        return res.status(400).json({
            success: false,
            message: "You already registered, Please Login"
        })
    }

    const hashedPassword = await bcrypt.hash(password , 10);
        const user = await userModel.create({
            fullName,
            email,
            password: hashedPassword,
            phone,
            adress
        })


        const token = jwt.sign({
            userId: user._id,

        },process.env.JWT_SECRET
        // {
        //     expiresIn: "365d"
        // }
        )
        console.log("Generated Token for Register:", token);
        res.cookie("token", token);

        res.status(201).json({
            success:true,
            message:"USER REGISTERED SUCCESSFULLY",
            user:{
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                adress: user.adress,
                token: token
            }
        })
        
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
    }

// User Login Controller 
const loginUser = async (req,res) => {
    const {email,password, phone} = req.body;
    try {
        const user = await userModel.findOne({
            email,
          phone

        });
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found, Please Register and Invalid Email or Password"
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success: false,
                message : "Invalid  or Password"
            })
        }

        const token = jwt.sign({
            userId: user._id, // this will be fetched in middleware findById so its imp 

        }, process.env.JWT_SECRET, {
            expiresIn: "365d"
        });
console.log("Login Token", token)
        // Set cookies for persistent login
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: "lax",
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
        })
        res.status(200).json({
            success : true,
            message : "User logged in Successfully",
            user : {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                adress: user.adress
            }
        })

    }catch(error){
       res.status(501).json({
        success: false,
        message: error.message
       })
    }
}

// For further User Check 
const userCheck = async (req,res) => {
    if(req.user){
        res.status(200).json({
            success: true,
            user:{
                _id: req.user._id,
                fullName: req.user.fullName,
                email: req.user.email,
                phone: req.user.phone,
                adress: req.user.adress
            }
        })
    }else{
        res.status(401).json({
            success: false,
            message: "Not Logged In Bro"
        })
    }
}

// For Logout 
const logOut = async (req,res) => {
    res.clearCookie("token",{
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    res.status(200).json({
        message: "User LogOut Successfully"
    })
}


module.exports = {
    registerUser,
    loginUser,
    logOut,
    userCheck
};

