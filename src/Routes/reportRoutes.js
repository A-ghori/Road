const express = require("express");
const userModel = require("../models/user.model");
const ImageVideosController = require("../Controller/images.videos.controller");
const {userMiddleWare} = require("../MiddleWare/Auth.Middleware");
// const imageVideos = require("../models/images.videos");
const multer = require("multer");
const Router = express.Router();

const uploadFile = multer({

    storage : multer.memoryStorage()
})

Router.post("/report",
    userMiddleWare,
    // uploadFile.single("file"), // generic field for videos and images 
    uploadFile.fields([
        { name: "images", maxCount: 1 },
        { name: "videos", maxCount: 1 }
    ]),

    ImageVideosController.createImageVideos
)

module.exports = Router;