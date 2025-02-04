import React, { useState, useEffect } from "react";
import NoteCard from "../../components/NotesCard";
import { useGetAllNotesQuery } from "../../redux/api/notesApiSlice";

const Home = () => {
  const { data: notes, isLoading } = useGetAllNotesQuery();
  const [allNotes, setAllNotes] = useState([]);

  // Update state when API data is available
  useEffect(() => {
    if (notes) {
      setAllNotes(notes);
    }
  }, [notes]);

  return (
    <div className=" bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Notes</h1>

      {isLoading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : allNotes.length === 0 ? (
        <div className="text-center text-gray-600">No notes found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNotes.map((note, index) => (
            <NoteCard key={index} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
