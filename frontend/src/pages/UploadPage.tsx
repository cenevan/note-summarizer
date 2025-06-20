import React, { useState } from "react";
import { Link } from "react-router-dom";
import ActionItemToggle from "../components/ActionItemsToggle";
import TagSelector from "../components/TagSelector";
import NoteCard from "../components/NoteCard";
import {
  ArrowUpTrayIcon,
  PencilSquareIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  InboxArrowDownIcon,
  LightBulbIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

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
    setResult(null);
    setShowModal(true);
  };

  const submitUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", noteTitle);
    formData.append("include_action_items", String(includeActionItems));
    formData.append("created_at", new Date().toISOString());
    formData.append("tags", JSON.stringify(selectedTags.map(tag => tag.id)));

    setLoading(true);
    setResult(null);
    setError(null);
    setShowModal(false);

    console.log("Submitting upload with data:", {
      file: file.name,
      title: noteTitle,
      include_action_items: includeActionItems,
      created_at: new Date().toISOString(),
      tags: selectedTags.map(tag => tag.id),
    });

    try {
      const res = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.detail?.toLowerCase().includes("openai api key")) {
          throw new Error("Your OpenAI API key appears to be invalid or missing. Please check your profile settings.");
        } else {
          throw new Error(errorData.detail || "Upload failed");
        }
      }

      const data = await res.json();
      setResult(data);

      const noteId = data.id;

      if (noteId) {
        for (const tag of selectedTags) {
          await fetch(`http://localhost:8000/notes/${noteId}/tags/${tag.id}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
        }
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("openai api key")) {
        setError("Your OpenAI API key appears to be invalid or missing. Please check your profile settings.");
      } else {
        setError(err.message || "Something went wrong while uploading the file.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-secondary to-gray-800 text-white p-8 font-sans flex flex-col items-center space-y-10">
      <h1 className="text-5xl font-extrabold tracking-tight text-primary drop-shadow-lg text-center flex items-center gap-3">
        <DocumentArrowUpIcon className="w-10 h-10 text-primary" />
        Upload a Note
      </h1>

      <div className="flex flex-col items-center space-y-6 bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-md border border-white/20 w-full max-w-2xl">
        <label
          htmlFor="file-upload"
          className="cursor-pointer px-5 py-3 bg-gray-800 text-white border border-gray-500 rounded-full hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowUpTrayIcon className="w-5 h-5" />
          Select a Note File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        {file && <p className="text-sm text-gray-300">Selected file: {file.name}</p>}

        <ActionItemToggle
          includeActionItems={includeActionItems}
          setIncludeActionItems={setIncludeActionItems}
        />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`px-6 py-2 rounded-full text-white transition font-semibold flex items-center justify-center gap-2 ${
            loading || !file
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-primary hover:bg-blue-600"
          }`}
        >
          {loading ? "Summarizing..." : (
            <>
              <InboxArrowDownIcon className="w-5 h-5" />
              Upload & Summarize
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 w-full max-w-2xl bg-red-100 text-red-700 border border-red-400 rounded-md px-4 py-3">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="mt-8 max-w-xl w-full shadow-lg shadow-blue-500/50 rounded-lg">
            <NoteCard
              noteId={result.id}
              name={noteTitle}
              summary={result.summary}
              actionItems={result.action_items}
              tagsProp={selectedTags}
              onDelete={async (id: number) => {
                const res = await fetch(`http://localhost:8000/notes/${id}`, {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                  }
                });
                if (res.ok) {
                  setResult(null);
                } else {
                  alert("Failed to delete note.");
                }
              }}
              expandLink={`/notes/${result.id}`}
            />
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white text-black rounded-md p-6 w-96">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <PencilSquareIcon className="w-5 h-5" />
              Name Your Note
            </h2>
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
                className="px-4 py-2 rounded-md bg-gray-300 text-black flex items-center justify-center"
              >
                <XMarkIcon className="w-5 h-5 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={submitUpload}
                className="px-4 py-2 rounded-md bg-blue-500 text-white flex items-center justify-center"
              >
                <ArrowUpTrayIcon className="w-5 h-5 inline mr-1" />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Future Enhancements Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mt-14">
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-lg">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <LightBulbIcon className="w-5 h-5 inline mr-1 text-primary" />
            Upload History
          </h2>
          <p className="text-sm text-gray-300">Track notes you’ve previously uploaded and summarized.</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-lg">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <LightBulbIcon className="w-5 h-5 inline mr-1 text-primary" />
            Tips for Better Summaries
          </h2>
          <p className="text-sm text-gray-300">Learn how to write notes that generate clearer summaries and actions.</p>
        </div>
        <div className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-lg">
          <h2 className="text-xl font-semibold mb-2 flex items-center">
            <SparklesIcon className="w-5 h-5 inline mr-1 text-primary" />
            Coming Soon: Drafting Workspace
          </h2>
          <p className="text-sm text-gray-300">Use context-aware AI to write and improve notes directly in the app.</p>
        </div>
      </div>
    </div>
  );
}