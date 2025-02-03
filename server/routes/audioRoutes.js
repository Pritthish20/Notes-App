import express from "express";
import multer from "multer";
import { uploadAudio } from "../config/cloudinary.js";
import * as mm from "music-metadata";  // Use music-metadata to decode and extract audio metadata

const router = express.Router();

// Use memory storage (avoid writing to disk)
const storage = multer.memoryStorage();

// Check if file is a valid audio file
const fileFilter = (req, file, cb) => {
  const allowedTypes = [ "audio/wav", "audio/ogg", "audio/mp3", "audio/mp4"];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only MP3, WAV, MP4a and OGG audio files are allowed"), false);
  }
};

// Define limits: file size can be adjusted (e.g., 10MB max)
const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Route to upload a single audio file (max 1 minute duration)
router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No audio file provided" });
    }

    // Decode the audio file to check its duration using music-metadata
    const metadata = await mm.parseBuffer(req.file.buffer);
    const durationInSeconds = metadata.format.duration; // Duration is in seconds

    // Check if audio file is within the 1-minute limit (60 seconds)
    if (durationInSeconds > 60) {
      return res.status(400).send({ message: "Audio file must be at most 1 minute long" });
    }

    // Upload the audio buffer to Cloudinary
    const result = await uploadAudio(req.file.buffer, { resource_type: "video" });

    // Return the uploaded audio file URL from Cloudinary
    res.status(201).send({
      message: "Audio uploaded successfully",
      audio: result.secure_url,
    });
  } catch (error) {
    console.log(error); // Optional: To log errors for debugging
    res.status(500).send({
      message: "Audio upload failed",
      error: error.message,
    });
  }
});

export default router;
