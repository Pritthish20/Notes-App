import express from "express";
import multer from "multer";
import { uploadImage } from "../config/cloudinary.js";

const router = express.Router();

// Use memory storage (avoid writing to disk)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { files: 4 }});

// Route to upload up to 10 images
router.post("/", upload.array("images", 4), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ message: "No images provided" });
    }

    // Upload each image buffer to Cloudinary
    const imageUploadPromises = req.files.map(file => uploadImage(file.buffer));

    // Wait for all uploads to complete
    const results = await Promise.all(imageUploadPromises);

    // Extract secure URLs from Cloudinary responses
    const uploadedImages = results.map(result => result.secure_url);

    res.status(201).send({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    res.status(500).send({
      message: "Image upload failed",
      error: error.message,
    });
  }
});

export default router;