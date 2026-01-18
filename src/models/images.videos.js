const mongoose = require("mongoose");
const userModel = require("./user.model");
const imageVideosSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    videos: {
        type: String,
        required: true,
    },
    images:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    userModel: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    }
},{
    timestamps: true
})

const imageVideos = mongoose.model("ImageVideos",imageVideosSchema);
module.exports = imageVideos