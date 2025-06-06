import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NoteCard from "../components/NoteCard";

interface Note {
  id: number;
  filename: string;
  content: string;
  summary: string;
  action_items: string;
}

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/notes/")
      .then((res) => res.json())
      .then(setNotes)
      .catch(() => console.error("Failed to fetch notes"));
  }, []);

  const deleteNote = async (id: number) => {
    const res = await fetch(`http://localhost:8000/notes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setNotes(notes.filter(note => note.id !== id));
    } else {
      alert("Failed to delete note.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white text-center p-8 font-sans">
      <h1 className="text-4xl font-bold text-primary mb-4">📚 My Notes</h1>
      <div className="mb-6 space-x-4">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <Link to="/upload" className="text-blue-400 hover:underline">Upload a Note</Link>
      </div>

      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              noteId={note.id}
              filename={note.filename}
              summary={note.summary}
              actionItems={note.action_items}
              onDelete={deleteNote}
              key={note.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}