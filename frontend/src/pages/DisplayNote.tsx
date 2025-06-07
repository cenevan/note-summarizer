import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface Note {
  id: number;
  filename: string;
  content: string;
  summary: string;
  action_items: string;
}

export default function DisplayNote() {
  const { id } = useParams();
  console.log("DisplayNote mounted, id:", id);

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching note with id:", id);

    fetch(`http://localhost:8000/notes/${id}`)
      .then((res) => {
        console.log("Fetch response status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch note");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched note data:", data);
        setNote(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching note:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    console.log("Loading note...");
    return <div className="text-center text-accent mt-10">Loading...</div>;
  }

  if (error) {
    console.error("Render error:", error);
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!note) {
    console.warn("Note not found or is null after loading");
    return <div className="text-center text-accent mt-10">Note not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white text-center p-8 font-sans">
      <Link to="/notes" className="text-blue-400 hover:underline mb-4 inline-block">
        ← Back to My Notes
      </Link>
      <h1 className="text-4xl font-bold text-primary mb-6">{note.filename}</h1>

      <div className="max-w-4xl bg-gray-700 mx-auto text-left space-y-8 p-6 rounded-lg shadow-md">
        <section>
          <h2 className="text-xl font-semibold text-accent mb-2">Original Content</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-accent mb-2">Summary</h2>
          <p className="text-gray-300 whitespace-pre-wrap">{note.summary}</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-accent mb-2">Action Items</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {note.action_items.split("\n").map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}