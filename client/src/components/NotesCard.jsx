import React from "react";
import { FiCopy } from "react-icons/fi";
import { FaMicrophone, FaImage, FaFileAlt } from "react-icons/fa";

const NoteCard = ({ note }) => {
  const { title, content, audio, images, date, type } = note;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content || "").then(() => {
      alert("Note copied to clipboard!");
    });
  };

  return (
    <div className="bg-white w-full max-w-sm p-6 rounded-lg shadow-md flex flex-col space-y-4 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Date and Note Type */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <p>{new Date(date).toLocaleString()}</p>
        {type === "audio" ? (
          <FaMicrophone className="text-teal-600" />
        ) : type === "image" ? (
          <FaImage className="text-blue-600" />
        ) : (
          <FaFileAlt className="text-gray-600" />
        )}
      </div>

      {/* Note Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{title}</h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{content}</p>

        {/* Display audio if available */}
        {audio && (
          <audio controls className="mt-4 w-full">
            <source src={audio} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}

        {/* Display image if available */}
        {images && images.length > 0 && (
          <div className="mt-4">
            <img src={images[0]} alt="Note" className="w-full rounded-md" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handleCopyToClipboard}
          className="text-gray-600 hover:text-gray-800 transition-colors"
          title="Copy to Clipboard"
        >
          <FiCopy size={22} />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
