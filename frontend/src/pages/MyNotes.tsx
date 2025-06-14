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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-secondary to-gray-800 text-white p-8 font-sans flex flex-col items-center space-y-10">
      <h1 className="text-5xl font-extrabold tracking-tight text-primary drop-shadow-lg text-center">
        📚 My Notes
      </h1>

      <div>
        <button
          onClick={() => setFiltering(!filtering)}
          className="px-6 py-2 rounded-full bg-primary text-white font-semibold hover:bg-blue-600 transition"
        >
          {filtering ? "Hide Filter" : "Filter by Tags"}
        </button>
      </div>

      {filtering && (
        <div className="w-full max-w-3xl border border-gray-400 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-md mt-4">
          <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
        </div>
      )}

      {notes.length === 0 ? (
        <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-md max-w-xl text-center">
          <div className="text-6xl mb-4">🗒️</div>
          <h2 className="text-2xl font-semibold text-white mb-2">No Notes Yet</h2>
          <p className="text-gray-300 mb-4">
            It looks like you haven’t uploaded any notes. Let’s get started!
          </p>
          <Link
            to="/upload"
            className="inline-block px-5 py-2 rounded-full bg-primary text-white hover:bg-blue-600 transition font-medium text-lg"
          >
            Upload Your First Note
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
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