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
  SparklesIcon,
  ClockIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { DocumentIcon } from "@heroicons/react/24/outline";

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
    <main className="bg-[#f8f9fa] text-[#001f3f] min-h-screen py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-[#001f3f] mb-6 flex justify-center items-center gap-3">
          <DocumentArrowUpIcon className="w-8 h-8 text-[#001f3f]" />
          Upload a Note
        </h1>

        <div className="space-y-6">
          <label
            htmlFor="file-upload"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files[0];
              if (dropped) setFile(dropped);
            }}
            className="flex flex-col items-center justify-center p-12 h-64 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-500 transition cursor-pointer w-full text-center"
          >
            {file ? (
              <>
                <DocumentIcon className="w-12 h-12 text-[#001f3f]" />
                <span className="mt-2 text-lg text-gray-800 font-medium">{file.name}</span>
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-5 h-5 text-gray-600" />
                <span className="mt-2 text-gray-700">Select a Note File</span>
              </>
            )}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".txt,.pdf,.doc,.docx,.ppt,.pptx,.md,.rtf,.html,.htm,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          <ActionItemToggle
            includeActionItems={includeActionItems}
            setIncludeActionItems={setIncludeActionItems}
          />

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`px-6 py-2 rounded-full text-white transition font-semibold flex items-center justify-center gap-2 ${
              loading || !file
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#001f3f] hover:bg-gray-800"
            }`}
          >
            {loading ? "Summarizing..." : (
              <>
                <InboxArrowDownIcon className="w-5 h-5" />
                Upload & Summarize
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 w-full max-w-2xl bg-red-100 text-red-700 border border-red-400 rounded-md px-4 py-3">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}

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
            <div className="bg-white rounded-lg shadow-md max-w-xl w-full p-8 text-black border border-gray-300 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PencilSquareIcon className="w-5 h-5" />
                Name Your Note
              </h2>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full p-2 border border-gray-700 rounded-md mb-4"
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

        {/* Supported File Types */}
        <section className="mt-12 w-full">
          <h2 className="text-2xl font-extrabold text-center text-[#001f3f] mb-6">
            Supported File Types
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: 'PDF', icon: <DocumentArrowUpIcon className="w-8 h-8" /> },
              { label: 'Word (DOCX)', icon: <DocumentIcon className="w-8 h-8" /> },
              { label: 'PowerPoint (PPTX)', icon: <SparklesIcon className="w-8 h-8" /> },
              { label: 'Text (TXT)', icon: <InboxArrowDownIcon className="w-8 h-8" /> },
              { label: 'Markdown (MD)', icon: <LightBulbIcon className="w-8 h-8" /> },
              { label: 'HTML', icon: <ClockIcon className="w-8 h-8" /> },
              { label: 'RTF', icon: <PencilSquareIcon className="w-8 h-8" /> },
              { label: 'Images (JPG, PNG)', icon: <PhotoIcon className="w-8 h-8" /> },
            ].map(({ label, icon }) => (
              <div
                key={label}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-default"
              >
                <div className="text-[#001f3f] mb-2">{icon}</div>
                <span className="mt-1 text-base font-medium text-gray-800">{label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}