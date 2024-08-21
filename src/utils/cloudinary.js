import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (localFilePath) {
            const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"})
            console.log("File uploaded successfully on cloudinary");
            return response.url;
        }
        else{
            return null;
        }
    } catch (error) {
        fs.unlinkSync(localFilePath)  //since file failed to upload on cloudinary, we deleted(unlink)the file from local server
        return null;
    }
}

export {uploadOnCloudinary}