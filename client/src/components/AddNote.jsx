import React, { useState, useRef, useEffect } from "react";
import { FiCopy, FiX, FiMaximize, FiMinimize } from "react-icons/fi";
import { FaMicrophone, FaVolumeUp, FaPlus, FaImage } from "react-icons/fa";
import { HiOutlineDownload } from "react-icons/hi";
import {
  useNewNoteMutation,
  useUploadAudioMutation,
  useUploadImageMutation,
} from "../redux/api/notesApiSlice";
import { toast } from "react-toastify";

const AddNote = ({ setModal, activeTab, setActiveTab }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isFavourite, setIsFavourite] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const durationIntervalRef = useRef(null);
  const [newNote] = useNewNoteMutation();
  const [uploadAudio] = useUploadAudioMutation();
  const [uploadImage] = useUploadImageMutation();
  const [loading, setLoading] = useState(false);

  const [note, setNote] = useState({
    title: "",
    content: "",
    images: [],
  });

  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedDateTime = currentDateTime.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleToggleFavourite = () => {
    setIsFavourite((prev) => !prev);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    setIsRecording(false);
  };

  const handleRecord = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Your browser does not support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!isRecording) {
      setTranscript("");
      setRecordedAudio(null);
      setRecordingDuration(0);
      audioChunksRef.current = [];

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        const newTranscript = lastResult[0].transcript;
        setTranscript((prev) => prev + " " + newTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        toast.error("Speech recognition error: " + event.error);
        stopRecording();
      };

      recognitionRef.current.onend = () => {
        if (isRecording && recordingDuration < 60) {
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.start();
      setIsRecording(true);

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/mp3",
          });
          setRecordedAudio(URL.createObjectURL(audioBlob));
        };
        mediaRecorderRef.current.start();
      });

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(" ");
        setTranscript(transcript);
        recognitionRef.current.stop();
      };

      setIsRecording(true);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      stopRecording();
    }
  };

  const handleTextToSpeech = () => {
    if (!transcript.trim()) {
      toast.warning("No note content to speak.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(transcript);
    speechSynthesis.speak(utterance);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setNote((prevNote) => ({
      ...prevNote,
      images: [...prevNote.images, ...files],
    }));
    setPhotoPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemovePhoto = (index) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    setNote((prevNote) => ({
      ...prevNote,
      images: prevNote.images.filter((_, i) => i !== index),
    }));
  };

  const handleCopyTranscript = () => {
    navigator.clipboard
      .writeText(transcript)
      .then(() => {
        toast.success("Transcript copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy transcript: ", err);
        toast.error("Failed to copy transcript.");
      });
  };

  const handleDownloadAudio = () => {
    if (recordedAudio) {
      const a = document.createElement("a");
      a.href = recordedAudio;
      a.download = "recording.mp3";
      a.click();
    } else {
      toast.warning("No audio recorded yet.");
    }
  };

  const handleCreateNote = async () => {
    if (!note.title.trim() || !note.content.trim() || note.images.length > 4) {
      toast.error("Invalid input: Ensure title and content are filled, and max 4 images.");
      return;
    }

    try {
      setLoading(true);
      const imageForm = new FormData();
      note.images.forEach((file) => {
        imageForm.append("images", file);
      });

      const uploadedImages = note.images.length
        ? await uploadImage(imageForm).unwrap()
        : { images: [] };

      let uploadedAudioUrl = "";
      if (recordedAudio) {
        const audioBlob = await fetch(recordedAudio).then((res) => res.blob());
        const audioForm = new FormData();
        audioForm.append("audio", audioBlob, "recording.mp3");
        const uploadedAudio = await uploadAudio(audioForm).unwrap();
        uploadedAudioUrl = uploadedAudio.audio;
      }

      const newNoteData = {
        title: note.title,
        content: note.content,
        images: uploadedImages.images,
        audio: uploadedAudioUrl,
        isFavourite,
      };

      await newNote(newNoteData).unwrap();

      toast.success("Note created successfully!");
      setLoading(false);
      setModal(false);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Error creating note. Please try again.");
    }
  };

  if (!setModal) return null;

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
            <h2 className="text-lg font-semibold">Add Notes</h2>
            <p className="text-sm text-gray-500">{formattedDateTime}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setModal(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="flex items-center ml-4 mt-2">
          <input
            type="checkbox"
            checked={isFavourite}
            onChange={handleToggleFavourite}
            className="mr-2 w-4 h-4"
          />
          <label className="text-gray-700 text-lg">Mark as Favourite</label>
        </div>

        {/* Audio Controls */}
        <div className="flex flex-col p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">
              {recordingDuration}s / 60s
            </div>
            <button
              onClick={handleDownloadAudio}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <HiOutlineDownload size={20} />
              <span>Download Audio</span>
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(recordingDuration / 60) * 100}%` }}
            ></div>
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
            onClick={() => setActiveTab("transcript")}
            className={`${
              activeTab === "transcript"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            } pb-2 transition-colors`}
          >
            Transcript
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`${
              activeTab === "create"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            } pb-2 transition-colors`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab("speaker")}
            className={`${
              activeTab === "speaker"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            } pb-2 transition-colors`}
          >
            Speaker Transcript
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-auto h-[calc(100%-180px)]">
          {/** NOTES TAB **/}
          {activeTab === "notes" && (
            <div>
              <h3 className="text-md font-semibold mb-2">Note Content</h3>
              {note.content ? (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {note.content}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  No content yet. Try recording or typing something.
                </p>
              )}

              <button
                onClick={handleRecord}
                className="mt-4 inline-flex items-center text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md transition"
              >
                <FaMicrophone className="mr-2" />
                {isRecording ? "Stop Recording" : "Record (1 min max)"}
              </button>
            </div>
          )}

          {/** TRANSCRIPT TAB **/}
          {activeTab === "transcript" && (
            <div>
              <h3 className="text-md font-semibold mb-2">Transcript</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {transcript || "No transcript available yet."}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <button
                  onClick={handleCopyTranscript}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <FiCopy className="mr-1" />
                  Copy
                </button>
              </div>
            </div>
          )}

          {/** CREATE TAB **/}
          {activeTab === "create" && (
            <div>
              <h3 className="text-md font-semibold mb-4">Create a New Note</h3>
              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={note.title}
                  onChange={(e) =>
                    setNote((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Note title"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Content</label>
                <textarea
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={note.content}
                  onChange={(e) =>
                    setNote((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Note content"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-600 mb-1">Add images</label>
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
                  {photoPreviews.map((src, index) => (
                    <div key={index} className="relative w-20 h-14 ">
                      <img
                        src={src}
                        alt={`Preview ${index}`}
                        className="object-cover rounded-md"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                disabled={loading}
                onClick={handleCreateNote}
                className="mt-4 inline-flex items-center text-white bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-md transition"
              >
                <FaPlus className="mr-2" />
                {loading ? 'Creating...' : 'Create Note'}
              </button>
            </div>
          )}

          {/** SPEAKER TAB **/}
          {activeTab === "speaker" && (
            <div>
              <h3 className="text-md font-semibold mb-2">Speaker Transcript</h3>
              <p className="text-gray-600 text-sm">
                Click the button below to have the note content read aloud.
              </p>
              <button
                onClick={handleTextToSpeech}
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

export default AddNote;