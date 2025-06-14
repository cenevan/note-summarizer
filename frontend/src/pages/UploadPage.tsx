import React, { useState } from "react";
import { Link } from "react-router-dom";
import ActionItemToggle from "../components/ActionItemsToggle";
import TagSelector from "../components/TagSelector";
import NoteCard from "../components/NoteCard";

interface Result {
  id: number;
  summary: string;
  action_items: string;
  tags: Tag[];
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("Untitled Note");
  const [includeActionItems, setIncludeActionItems] = useState(true);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const handleUpload = () => {
    if (!file) return;
    setShowModal(true);
  };

  const submitUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", noteTitle);
    formData.append("include_action_items", String(includeActionItems));
    formData.append("tags", JSON.stringify(selectedTags.map(tag => tag.id)));

    setLoading(true);
    setResult(null);
    setError(null);
    setShowModal(false);

    try {
      const res = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setResult(data);

      const noteId = data.id;

      if (noteId) {
        for (const tag of selectedTags) {
          await fetch(`http://localhost:8000/notes/${noteId}/tags/${tag.id}`, {
            method: "POST",
          });
        }
      }
    } catch (err) {
      setError("Something went wrong while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white text-center p-8 font-sans flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary mb-4">📝 Upload a Note</h1>

      <div className="mb-6 space-x-4">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <Link to="/notes" className="text-blue-400 hover:underline">View My Notes</Link>
      </div>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="inline-block cursor-pointer px-4 py-2 bg-gray-800 text-white border border-gray-500 rounded-md hover:bg-gray-700"
        >
          📁 Select a Note File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        {file && <p className="mt-2 text-sm text-gray-300">Selected file: {file.name}</p>}
      </div>

      <ActionItemToggle
        includeActionItems={includeActionItems}
        setIncludeActionItems={setIncludeActionItems}
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`px-6 py-2 rounded-md text-white transition ${
          loading || !file
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-300 hover:bg-blue-700"
        }`}
      >
        {loading ? "Summarizing..." : "Upload & Summarize"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        console.log("Result:", result),
        <div className="mt-8 max-w-xl w-full">
          <NoteCard
            noteId={result.id}
            name={noteTitle}
            summary={result.summary}
            actionItems={result.action_items}
            tagsProp={selectedTags}
            onDelete={
              async (id: number) => {
                const res = await fetch(`http://localhost:8000/notes/${id}`, { method: 'DELETE' });
                if (res.ok) {
                  setResult(null);
                } else {
                  alert("Failed to delete note.");
                }
              }
            }
            expandLink={`/notes/${result.id}`}
          />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white text-black rounded-md p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Name Your Note</h2>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Untitled Note"
            />
            <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md bg-gray-300 text-black"
              >
                Cancel
              </button>
              <button
                onClick={submitUpload}
                className="px-4 py-2 rounded-md bg-blue-500 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}