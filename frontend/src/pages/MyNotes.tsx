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

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>📚 My Notes</h1>
      <Link to="/">← Back to Home</Link> | <Link to="/upload">Upload a Note</Link>

      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        notes.map((note) => (
          <NoteCard
            key={note.id}
            filename={note.filename}
            summary={note.summary}
            actionItems={note.action_items}
          />
        ))
      )}
    </div>
  );
}