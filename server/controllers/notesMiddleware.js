import Notes from '../models/notes.js'
import { v2 as cloudinary } from 'cloudinary';

export const createNote=async(req,res)=>{
    try {
        const { title, content,images,audio,isFavourite } = req.body;
    
        if (!title || content || images.length > 4) {
          return res.status(400).json({ error: "Invalid, Enter valid data" });
        }
    
        const newNote = new Notes({
          userId: req.user._id,
          title,
          content,
          audio,
          images,
          isFavourite
        });
    
        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

export const updateNote=async(req,res)=>{
  try {
    const { noteId } = req.params;
    const { title, content, images, removeImages, audio, removeAudio, isFavourite } = req.body;

    // Find the note and ensure it belongs to the logged-in user
    const note = await Notes.findOne({ _id: noteId, userId: req.user._id });

    if (!note) return res.status(404).json({ error: "Note not found or unauthorized" });

    // Update title and content
    if (title) note.title = title;
    if (content) note.content = content;
    if (isFavourite) note.isFavourite = isFavourite;

    // 🔹 Handle Image Removal
    if (removeImages) {
      try {

        // Remove images from Cloudinary
        for (const imageUrl of removeImages) {
          const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract publicId
          await cloudinary.uploader.destroy(publicId);
        }

        // Filter out removed images
        note.images = note.images.filter(image => !imagesToRemove.includes(image));
      } catch (err) {
        return res.status(400).json({ error: "Error removing images." });
      }
    }

    // 🔹 Handle Image Addition
    if (images) {
      try {
        // Append new images (limit to a max of 10)
        note.images = [...note.images, ...images].slice(-4);
      } catch (err) {
        return res.status(400).json({ error: "Invalid images format." });
      }
    }

    // 🔹 Handle Audio Removal
    if (removeAudio && note.audio) {
      try {
        const audioPublicId = note.audio.split("/").pop().split(".")[0]; // Extract publicId for Cloudinary
        await cloudinary.uploader.destroy(audioPublicId, { resource_type: "video" });
        note.audio = null;
      } catch (err) {
        return res.status(400).json({ error: "Error removing audio file." });
      }
    }

    // 🔹 Handle Audio Update
    if (audio) {
      try {
        // Replace existing audio if present
        if (note.audio) {
          const existingAudioPublicId = note.audio.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(existingAudioPublicId, { resource_type: "video" });
        }

        note.audio = audio; // Store new audio URL
      } catch (err) {
        return res.status(400).json({ error: "Error updating audio file." });
      }
    }

    // Save the updated note
    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Update failed:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export const getAllNotes=async(req,res)=>{
    try {
        const allNotes = await Notes.find({ userId: req.user._id });
        res.status(200).json(allNotes);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

export const specificNote=async(req,res)=>{
    try {
        const { id } = req.params;
    
        const note = await Notes.findOne({ _id: id, user: req.user._id });
        if (!note) return res.status(404).json({ error: "Note not found or unauthorized" });
    
        res.status(200).json(note);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

export const deleteNote=async(req,res)=>{
    try {
        const { id } = req.params;
    
       //Find the note before deletion
    const note = await Notes.findOne({ _id: id, user: req.user._id });
    if (!note) return res.status(404).json({ error: "Note not found or unauthorized" });

    // Delete images from Cloudinary
    if (note.images && note.images.length > 0) {
      for (const imageUrl of note.images) {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
    }

    // Delete audio from Cloudinary
    if (note.audio) {
      const audioPublicId = note.audio.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(audioPublicId, { resource_type: "video" });
    }

    // Delete the note from the database
    await Notes.findOneAndDelete({ _id: id, user: req.user._id });

    res.status(200).json({ message: "Note deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}