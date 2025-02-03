import React, { useState, useRef, useEffect } from "react";
import {
  FiCopy,
  FiX,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";
import {
  FaMicrophone,
  FaVolumeUp,
  FaPlus,
  FaImage,
} from "react-icons/fa";
import { HiOutlineDownload } from "react-icons/hi";

const AddNote = ({ setModal }) => {
  // Tabs: "notes", "transcript", "create", "speaker"
  const [activeTab, setActiveTab] = useState("transcript");

  // Fullscreen state
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Recording states & references
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // “Read More” toggle for transcript
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  // The entire transcript (for demonstration)
  const fullTranscript = `I'm recording an audio to transcribe into text for the assignment of engineering in terms of actors. This is a longer transcript demo to illustrate the "Read More" functionality.`;

  // The note you’re creating
  const [note, setNote] = useState({
    title: "",
    content: "",
    photos: [],
  });

  // Previews for any uploaded images
  const [photoPreviews, setPhotoPreviews] = useState([]);

  // Dynamic date and time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update the date and time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Format the date and time
  const formattedDateTime = currentDateTime.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  /**
   * -----------------------
   *  Speech Recognition
   * -----------------------
   */
  const handleRecord = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!isRecording) {
      // Start recording
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        // Append transcript to note content
        setNote((prev) => ({
          ...prev,
          content: prev.content
            ? prev.content + " " + transcript
            : transcript,
        }));
        alert("Recording finished. Transcript added to note content.");
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        alert("Speech recognition error: " + event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
      setIsRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.stop();
        }
      }, 60000);
    } else {
      // Stop recording manually
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  /**
   * -----------------------
   *  Text-to-Speech
   * -----------------------
   */
  const handleTextToSpeech = () => {
    if (!note.content.trim()) {
      alert("No note content to speak.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(note.content);
    speechSynthesis.speak(utterance);
  };

  /**
   * -----------------------
   *  Photo Upload
   * -----------------------
   */
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setNote((prevNote) => ({ ...prevNote, photos: files }));
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  /**
   * -----------------------
   *  Copy Transcript
   * -----------------------
   */
  const handleCopyTranscript = () => {
    // For simplicity, copy the entire `fullTranscript`
    navigator.clipboard
      .writeText(fullTranscript)
      .then(() => {
        alert("Transcript copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy transcript: ", err);
      });
  };

  /**
   * -----------------------
   *  Download Audio (stub)
   * -----------------------
   */
  const handleDownloadAudio = () => {
    alert("Downloading audio (placeholder)...");
    // In a real app, you'd trigger a file download here.
  };

  /**
   * -----------------------
   *  Create Note
   * -----------------------
   */
  const handleCreateNote = () => {
    if (!note.title.trim() || !note.content.trim()) {
      alert("Please fill out all note fields.");
      return;
    }
    // In a real app, dispatch or call an API here.
    alert("Note created (placeholder)!");
    setModal(false); // close modal
  };

  /**
   * -----------------------
   *  Modal Layout
   * -----------------------
   */
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
            <h2 className="text-lg font-semibold">
              Add Notes
            </h2>
            <p className="text-sm text-gray-500">
              {formattedDateTime}
            </p>
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

        {/* Audio Controls */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm text-gray-600">
            00:00 / 01:00
          </div>
          <button
            onClick={handleDownloadAudio}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
          >
            <HiOutlineDownload size={20} />
            <span>Download Audio</span>
          </button>
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

              {photoPreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Photos:</h4>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {photoPreviews.map((src, index) => (
                      <img
                        key={index}
                        src={src}
                        alt={`Preview ${index}`}
                        className="w-full h-auto object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
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
                {showFullTranscript
                  ? fullTranscript
                  : fullTranscript.slice(0, 90) + "..."}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                {fullTranscript.length > 90 && (
                  <button
                    onClick={() => setShowFullTranscript(!showFullTranscript)}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    {showFullTranscript ? "Show Less" : "Read More"}
                  </button>
                )}
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
                  {photoPreviews.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Preview ${index}`}
                      className="w-full h-auto object-cover rounded-md"
                    />
                  ))}
                </div>
              )}

              <button
                onClick={handleCreateNote}
                className="mt-4 inline-flex items-center text-white bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-md transition"
              >
                <FaPlus className="mr-2" />
                Create Note
              </button>
            </div>
          )}

          {/** SPEAKER TAB **/}
          {activeTab === "speaker" && (
            <div>
              <h3 className="text-md font-semibold mb-2">
                Speaker Transcript
              </h3>
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