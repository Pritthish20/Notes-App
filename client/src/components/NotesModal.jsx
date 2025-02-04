import React, { useState, useRef } from "react";
import {
  FiX,
  FiMaximize,
  FiMinimize,
  FiTrash,
  FiStar,
} from "react-icons/fi";
import {
  FaVolumeUp,
  FaImage,
  FaSave,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useUploadAudioMutation,
  useUploadImageMutation,
  useDeleteNoteMutation,
  useUpdateNoteMutation,
} from "../redux/api/notesApiSlice";

const NotesModal = ({ setModal, note: initialNote}) => {
  // Destructure note fields
  const { _id, title, content, userId, audio, images, isFavourite } = initialNote;

  // State for managing the note
  const [note, setNote] = useState({
    title,
    content,
    userId,
    audio: audio || null,
    images: images || [],
    isFavourite,
  });

  // State for tracking removed images and audio
  const [removeImages, setRemoveImages] = useState([]);
  const [removeAudio, setRemoveAudio] = useState(false);

  // State for tracking newly uploaded images and audio
  const [newImages, setNewImages] = useState([]);
  const [newAudio, setNewAudio] = useState(null);

  // Tabs: "notes", "speaker"
  const [activeTab, setActiveTab] = useState("notes");

  // Fullscreen state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Previews for any uploaded images
  const [photoPreviews, setPhotoPreviews] = useState(
    images ? images.map((img) => (img instanceof File ? URL.createObjectURL(img) : img)) : []
  );

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef(null);

  // Track if the note has been changed
  const [isNoteChanged, setIsNoteChanged] = useState(false);

  // RTK Mutations
  const [uploadAudio] = useUploadAudioMutation();
  const [uploadImage] = useUploadImageMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  // Handle changes to the note
  const handleNoteChange = (e) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
    setIsNoteChanged(true);
  };

  // Handle image upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));

    setNewImages((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...previews]);
    setIsNoteChanged(true);
  };

  // Handle image removal
  const handleRemoveImage = (image) => {
    if (note.images.includes(image)) {
      // If the image is from the existing note, add it to removeImages
      setRemoveImages((prev) => [...prev, image]);
    } else {
      // If the image is newly uploaded, remove it from newImages
      setNewImages((prev) => prev.filter((img) => img !== image));
    }

    // Remove from the note's images and previews
    setNote((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== image),
    }));
    setPhotoPreviews((prev) => prev.filter((preview) => preview !== image));
    setIsNoteChanged(true);
  };

  // Handle audio file upload
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAudio(file);
      setNote((prev) => ({ ...prev, audio: URL.createObjectURL(file) }));
      setIsNoteChanged(true);
    }
  };

  // Handle audio playback
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle audio progress
  const handleAudioProgress = (e) => {
    const currentTime = e.target.currentTime;
    const duration = e.target.duration;
    setAudioProgress((currentTime / duration) * 100);
  };

  // Handle audio removal
  const handleRemoveAudio = () => {
    if (note.audio) {
      setRemoveAudio(true);
    }
    setNewAudio(null);
    setNote((prev) => ({ ...prev, audio: null }));
    setIsNoteChanged(true);
  };

  // Handle note update
  const handleUpdateNote = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Please fill out all note fields.");
      return;
    }

    try {
      setLoading(true);
      // Upload new images if any
      let uploadedImages = [];
      if (newImages.length > 0) {
        const imageForm = new FormData();
        newImages.forEach((file) => imageForm.append("images", file));
        const response = await uploadImage(imageForm).unwrap();
        uploadedImages = response.images;
      }

      // Upload new audio if any
      let uploadedAudio = null;
      if (newAudio) {
        const audioForm = new FormData();
        audioForm.append("audio", newAudio);
        const response = await uploadAudio(audioForm).unwrap();
        uploadedAudio = response.audio;
      }

      // Prepare the updated note data
      const updatedNote = {
        ...note,
        images: [...note.images, ...uploadedImages],
        audio: uploadedAudio || note.audio,
        removeImages,
        removeAudio,
      };

      // Call the update mutation
      await updateNote({ id: _id, updatedNotes: updatedNote }).unwrap();
      toast.success("Note updated successfully!");
      setLoading(false);
      setIsNoteChanged(false);
      setModal(false);
    } catch (err) {
      toast.error("Failed to update note.");
      console.error(err);
    }
  };

  // Handle note deletion
  const handleDeleteNote = async () => {
    try {
      setLoading(true);
      await deleteNote(_id).unwrap();
      toast.success("Note deleted successfully!");
      setModal(false);
      setLoading(false);

    } catch (err) {
      toast.error("Failed to delete note.");
      console.error(err);
    }
  };

  // Handle favourite toggle
  const handleFavouriteToggle = () => {
    setNote((prev) => ({ ...prev, isFavourite: !prev.isFavourite }));
    setIsNoteChanged(true);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center ${
        isFullScreen ? "p-0" : "p-6"
      } z-50`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg relative ${
          isFullScreen ? "w-screen h-screen" : "w-full max-w-4xl h-[73vh]"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Note</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleFavouriteToggle}
              className={`text-gray-600 hover:text-yellow-500 mr-12  ${
                note.isFavourite ? "text-yellow-500" : ""
              }`}
            >
              <FiStar size={24} />
            </button>
            <button
              onClick={() => setModal(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="absolute top-4 right-14 text-gray-600 hover:text-gray-800"
          title="Toggle Fullscreen"
        >
          {isFullScreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
        </button>

        {/* Tabs */}
        <div className="flex space-x-4 p-4 border-b">
          <button
            onClick={() => setActiveTab("notes")}
            className={`${
              activeTab === "notes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            } pb-2 transition-colors`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("speaker")}
            className={`${
              activeTab === "speaker"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            } pb-2 transition-colors`}
          >
            Speaker Content
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-auto h-[calc(100%-180px)]">
          {/** NOTES TAB **/}
          {activeTab === "notes" && (
            <div>
              <h3 className="text-md font-semibold mb-4">Edit Note</h3>
              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={note.title}
                  onChange={handleNoteChange}
                  placeholder="Note title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Content</label>
                <textarea
                  rows="4"
                  name="content"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={note.content}
                  onChange={handleNoteChange}
                  placeholder="Note content"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Add Photos</label>
                <label className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition">
                  <FaImage className="mr-2" />
                  Upload Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {photoPreviews.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-md" // Adjusted height to h-32
                      />
                      <button
                        onClick={() => handleRemoveImage(image)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-sm"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Add Audio</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {note.audio ? (
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePlayPause}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                    </button>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${audioProgress}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={handleRemoveAudio}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FiTrash size={20} />
                    </button>
                  </div>
                  <audio
                    ref={audioRef}
                    src={note.audio}
                    onTimeUpdate={handleAudioProgress}
                    onEnded={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                <p className="text-gray-500">No audio available.</p>
              )}

              <div className="flex justify-between mt-4">
                <button
                disabled={loading}
                  onClick={handleDeleteNote}
                  className="inline-flex items-center text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition"
                >
                  <FiTrash className="mr-2" />
                  {loading ? 'Deleting...':'Delete Note'}
                </button>
                <button
                  onClick={handleUpdateNote}
                  disabled={!isNoteChanged && loading}
                  className={`inline-flex items-center text-white ${
                    isNoteChanged ? "bg-teal-500 hover:bg-teal-600" : "bg-gray-400"
                  } px-4 py-2 rounded-md transition`}
                >
                  <FaSave className="mr-2" />
                  {loading ? 'Saving...':'Save Note'}
                </button>
              </div>
            </div>
          )}

          {/** SPEAKER TAB **/}
          {activeTab === "speaker" && (
            <div>
              <h3 className="text-md font-semibold mb-2">Speaker Content</h3>
              <p className="text-gray-600 text-sm">
                Click the button below to have the note content read aloud.
              </p>
              <button
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(note.content);
                  speechSynthesis.speak(utterance);
                }}
                className="mt-4 inline-flex items-center text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md transition"
              >
                <FaVolumeUp className="mr-2" />
                Speak Note Content
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesModal;