const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

require("dotenv").config();
// For User Middleware
const userMiddleWare = async (req,res,next) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message: "Please Login First or Register"
        })
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}

module.exports = userMiddleWare