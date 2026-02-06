const express = require("express");

const {userMiddleWare} = require("../MiddleWare/Auth.Middleware")
const authController = require("../Controller/auth.controller");
const router = express.Router();


router.post("/user/login",authController.loginUser);
router.post("/user/register",authController.registerUser);
router.get("/user/logout",authController.logOut);


// Checking Controller 
router.get("/check", userMiddleWare, authController.userCheck)

module.exports = router;
