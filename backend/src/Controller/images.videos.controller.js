const imageVideos = require("../models/images.videos");
const storage = require("../storage/storage.service");
const { v4: uuid } = require("uuid");

async function createImageVideos(req, res) {
    try {
        console.log(req.files); //  check koth diye files asche
        console.log(req.body);

        // check if files exist
        if (!req.files || (!req.files.images && !req.files.videos)) {
            return res.status(400).json({
                message: "No files uploaded or You are not Login",
                success: false
            });
        }

        // Upload image if exists
        let imageUrl = null;
        if (req.files.images) {
            const imageFile = req.files.images[0];
            const imageUploadResult = await storage.uploadFile(
                imageFile.buffer.toString("base64"),
                // uuid() + "-" + imageFile.originalname
                imageFile.originalname
            );
            imageUrl = imageUploadResult.url;
        }

        // Upload video if exists
        let videoUrl = null;
        if (req.files.videos) {
            const videoFile = req.files.videos[0]; // req.files structure hota hai object of arrays:
            // not a single file sending but i send image + videos so yeahh 
            const videoUploadResult = await storage.uploadFile(
                videoFile.buffer.toString("base64"),
                // uuid() + "-" + videoFile.originalname
                videoFile.originalname
            );
            videoUrl = videoUploadResult.url;
        }

        // Save to DB
        const imageVideoFiles = await imageVideos.create({
            name: req.body.name,
            images: imageUrl,
            videos: videoUrl,
            description: req.body.description,
            user: req.user ? req.user._id : null // req.user ki login id paba geche na pele user id ke null set koro
        });

        res.status(201).json({
            message: "Files Uploaded Successfully",
            success: true,
            imageVideos: imageVideoFiles
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Upload failed",
            success: false
        });
    }
}

module.exports = { createImageVideos };
