import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // fs = file system on node

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image
 const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto"
        })

        //file has been uploaded successfully 
        //console.log("file is uploaded on cloudinary ", response.url)

        fs.unlinkSync(localFilePath) //even after successfull uploading to cloudinary we do not want to keep the files on local server due to less storage
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)// remove the locally saved temporary file as the upload operation got failed
        return null;
    }
 }

 const deleteFromCloudinary = async (publicId) => {
    try {
        if(!publicId) return null;

        const response = await cloudinary.uploader.destroy(publicId)

        return response

    } catch (error) {
        console.log("Error while deleting  the cover image!! :", error)

        return null
    }
 }


 export {uploadOnCloudinary, deleteFromCloudinary}









// cloudinary.v2.uploader.upload(
//   "URL",
//   {
//     public_id: "olympic_flag",
//   },
//   function (error, result) {
//     console.log(result);
//   }
// )









