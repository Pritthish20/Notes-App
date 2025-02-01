import mongoose from "mongoose";

const notesSchema= new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    audio:{
        type: String,
        default: null,
    },
    images:[
        {
            type: String,
        }
    ],
    isFavourite:{
        type: Boolean,
        default: false,
    }
},{timestamps: true})

notesSchema.index({ userId: 1 }); // adding indexing to optimize performance

const Notes=mongoose.model('Notes',notesSchema);

export default Notes;