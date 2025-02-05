import { FiCopy, FiStar } from "react-icons/fi";
import { FaMicrophone, FaImage, FaFileAlt } from "react-icons/fa";
import NotesModal  from './NotesModal'
import { useState } from "react";
import { toast } from "react-toastify";

const NoteCard = ({ note }) => {
  const { id, title, content, audio, images, date, type, isFavourite } = note;
  
  const [viewModal,setViewModal] =useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content || "").then(() => {
      toast.info("Note copied to clipboard!");
    });
  };

  return (
    <div
      className="bg-white w-full max-w-sm p-6 rounded-lg shadow-md flex flex-col space-y-4 border border-gray-200 hover:shadow-lg transition-shadow"
    >
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
      <div onClick={() => setViewModal(true)} className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{content}</p>

        {/* Audio Information */}
        {audio && (
          <div className="mt-2 flex items-center text-sm text-teal-600">
            <FaMicrophone className="mr-2" /> Audio Available
          </div>
        )}

        {/* Image Information */}
        {images && images.length > 0 && (
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <FaImage className="mr-2" /> {images.length} Image(s) Available
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
        <FiStar className={isFavourite ? "text-yellow-500" : "text-gray-400"} />
      </div>
      {viewModal && <NotesModal setModal={setViewModal} note={note} />}
    </div>
  );
};

export default NoteCard;
