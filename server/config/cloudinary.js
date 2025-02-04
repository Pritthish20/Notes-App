import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import streamifier from "streamifier"; // Converts buffer to stream

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadImage = async (fileBuffer) => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "Notes-app-images", 
          allowed_formats: ["png", "jpg", "jpeg", "svg", "webp"], 
          quality: "auto:good", 
          format: "auto",
        },
        (error, result) => {
          if (error) {
            reject("Cloudinary Upload failed: " + error.message);
          } else {
            resolve(result);
          }
        }
      );

      // Convert Buffer to Readable Stream
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
  } catch (error) {
    console.log("Cloudinary Upload failed:", error.message);
    // throw error;
  }
};

export const uploadAudio = async (fileBuffer) => {
  try {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",  
          folder: "Notes-app-audio",   
          allowed_formats: ["mp3", "wav", "ogg", "mp4"], 
          quality: "auto",         
          format: "mp3",          
        },
        (error, result) => {
          if (error) {
            reject("Cloudinary Audio Upload failed: " + error.message);
          } else {
            resolve(result);
          }
        }
      );

      // Convert Buffer to Readable Stream and upload to Cloudinary
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
  } catch (error) {
    console.log("Cloudinary Audio Upload failed:", error.message);
    // throw error;
  }
};