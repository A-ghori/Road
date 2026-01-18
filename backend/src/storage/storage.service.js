const ImageKit = require("imagekit") 
require("dotenv").config();

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});
async function uploadFile(file,fileName) {
   try {
    const result = await imagekit.upload({

        file: file,
        fileName: fileName
     })
    return result
   } catch (error) {
       throw new Error(error.message || "Image Upload Failed From Service.js");
   }
    }

    module.exports = {uploadFile};