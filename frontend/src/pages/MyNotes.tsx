import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NoteCard from "../components/NoteCard";
import TagSelector from "../components/TagSelector";
import {
  FunnelIcon,
  XMarkIcon,
  PlusCircleIcon,
  DocumentIcon
} from "@heroicons/react/24/outline";

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
    if (selectedTags.length > 0) {
      const query = selectedTags.map(tag => `tags=${encodeURIComponent(tag.name)}`).join("&");
      fetch(`http://localhost:8000/notes/tags/?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((res) => res.json())
        .then(setNotes)
        .catch(() => console.error("Failed to fetch notes"));
    } else {
      fetch("http://localhost:8000/notes/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then((res) => res.json())
        .then(setNotes)
        .catch(() => console.error("Failed to fetch notes"));
    }
  }, [selectedTags]);

  const deleteNote = async (id: number) => {
    const res = await fetch(`http://localhost:8000/notes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (res.ok) {
      setNotes(notes.filter(note => note.id !== id));
    } else {
      alert("Failed to delete note.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-secondary to-gray-800 text-white p-8 font-sans flex flex-col items-center space-y-10">
      <h1 className="text-5xl font-extrabold tracking-tight text-primary drop-shadow-lg text-center flex items-center gap-3">
        <DocumentIcon className="w-10 h-10 text-primary" />
        My Notes
      </h1>

      <div className="w-full max-w-6xl mt-4 rounded-t-xl overflow-hidden">
        <div className="relative self-start">
          <button
            onClick={() => setFiltering(!filtering)}
            className="px-4 py-1 bg-white/10 text-white font-semibold hover:bg-white/20 transition flex items-center gap-2 border-b border-white/20 rounded-t-lg"
          >
            {filtering ? (
              <>
                <XMarkIcon className="w-5 h-5" />
                Hide Filter
              </>
            ) : (
              <>
                <FunnelIcon className="w-5 h-5" />
                Filter by Tags
              </>
            )}
          </button>
          <div
            className={`absolute z-10 top-full left-0 w-1/3 bg-gray-700/90 border border-white/10 px-6 py-4 transition-opacity duration-300 rounded-b-lg ${
              filtering ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
          </div>
        </div>

        <div className="bg-white/5 rounded-none border border-white/20 shadow-md min-h-[calc(100vh-14rem)]">
          {notes.length === 0 ? (
            <div className="p-8 text-center flex flex-col justify-center items-center h-[66vh]">
              <div className="text-6xl mb-4">
                <DocumentIcon className="w-12 h-12 text-white/70 mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">No Notes Yet</h2>
              <p className="text-gray-300 mb-4">
                It looks like you haven’t uploaded any notes. Let’s get started!
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white hover:bg-blue-600 transition font-medium text-lg"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Upload Your First Note
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
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
      </div>
    </div>
  );
}