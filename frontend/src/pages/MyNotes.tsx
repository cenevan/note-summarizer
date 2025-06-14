import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NoteCard from "../components/NoteCard";
import TagSelector from "../components/TagSelector";

interface Note {
  id: number;
  name: string;
  content: string;
  summary: string;
  action_items: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [filtering, setFiltering] = useState(false);

  useEffect(() => {
    if (filtering && selectedTags.length > 0) {
      const query = selectedTags.map(tag => `tags=${encodeURIComponent(tag.name)}`).join("&");
      fetch(`http://localhost:8000/notes/tags/?${query}`)
        .then((res) => res.json())
        .then(setNotes)
        .catch(() => console.error("Failed to fetch notes"));
    } else {
      fetch("http://localhost:8000/notes/")
        .then((res) => res.json())
        .then(setNotes)
        .catch(() => console.error("Failed to fetch notes"));
    }
  }, [selectedTags, filtering]);

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

      <div className="mb-4">
        <button
          onClick={() => setFiltering(!filtering)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          {filtering ? "Hide Filter" : "Filter by Tags"}
        </button>
      </div>

      {filtering && (
        <div className="mb-6 border border-gray-400 bg-gray-800 p-4 rounded">
          <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
        </div>
      )}

      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              noteId={note.id}
              name={note.name}
              summary={note.summary}
              actionItems={note.action_items}
              onDelete={deleteNote}
              key={note.id}
              expandLink={`/notes/${note.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}