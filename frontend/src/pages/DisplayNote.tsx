import React, { useEffect, useState } from "react";
import TagSelector from "../components/TagSelector";
import { useParams, Link } from "react-router-dom";
import ActionItemsToggle from "../components/ActionItemsToggle";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  ChevronLeftIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MinusIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

interface Note {
  id: number;
  name: string;
  content: string;
  summary: string;
  action_items: string;
  created_at: string;
  updated_at: string;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

export default function DisplayNote() {
  const { isLoggedIn, isAuthInitialized } = useAuth();
  if (!isAuthInitialized) {
    return null; // or a loading spinner
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  const { id } = useParams();
  console.log("DisplayNote mounted, id:", id);

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [includeActionItems, setIncludeActionItems] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);

  const changeName = async (editedName: string) => {
    if (!note) {
      console.error("Note is null, cannot change name");
      return;
    }
    const res = await fetch(`${API_URL}/notes/${note.id}/name`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ name: editedName, updated_at: new Date().toISOString() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setNote(updated);
      setIsRenaming(false);
    } else {
      alert("Failed to rename note.");
    }
  }

  useEffect(() => {
    console.log("Fetching note with id:", id);

    fetch(`${API_URL}/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => {
        console.log("Fetch response status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch note");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched note data:", data);
        setNote(data);
        setEditedName(data.name);
        setCreatedAt(new Date(data.created_at).toLocaleString());
        setLastModified(new Date(data.updated_at).toLocaleString());
        setLoading(false);

        fetch(`${API_URL}/tags/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
          .then((res) => res.json())
          .then((tagsData) => setTags(tagsData))
          .catch((err) => console.error("Error fetching tags:", err));
      })
      .catch((err) => {
        console.error("Error fetching note:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch(`${API_URL}/users/me/usage`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch usage data");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched usage data:", data);

        data = data.filter((item: any) => item.note_id === parseInt(id!));

        const inputSum = data.reduce((acc: number, item: any) => acc + (item.input_tokens || 0), 0);
        const outputSum = data.reduce((acc: number, item: any) => acc + (item.output_tokens || 0), 0);
        setInputTokens(inputSum);
        setOutputTokens(outputSum);
      })
      .catch((err) => console.error("Error fetching usage data:", err)
    )
  })

  if (loading) {
    console.log("Loading note...");
    return <div className="text-center text-[#001f3f] mt-10">Loading...</div>;
  }

  if (error) {
    console.error("Render error:", error);
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (!note) {
    console.warn("Note not found or is null after loading");
    return <div className="text-center text-[#001f3f] mt-10">Note not found.</div>;
  }

  return (
    <main className="bg-[#f8f9fa] text-[#001f3f] min-h-screen py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8">
        <div>
          <Link
            to="/notes"
            className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border border-blue-400 text-blue-400 hover:bg-blue-600 transition"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back to My Notes
          </Link>
        </div>
      {isRenaming ? (
        <div className="flex justify-center items-center gap-2 mb-6">
          <input
            className="text-4xl font-bold text-[#001f3f] bg-white border-b border-gray-300 focus:outline-none text-center"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => changeName(editedName)}
            className="text-sm px-3 py-1 rounded-md border border-green-400 text-green-700 bg-white hover:bg-green-100 transition"
            title="Save Name"
          >
            <CheckIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-2 mb-6">
          <h1 className="text-4xl font-bold text-[#001f3f]">{note.name}</h1>
          <button
            onClick={() => setIsRenaming(true)}
            className="text-sm text-[#001f3f] hover:text-blue-800"
            title="Rename Note"
          >
            <PencilSquareIcon className="w-5 h-5 text-[#001f3f] hover:text-blue-800" />
          </button>
        </div>
      )}

      <div className="max-w-3xl w-full flex flex-wrap justify-center gap-2">
        {tags.map(tag => (
          <span
            key={tag.id}
            className="pl-3 pr-2 py-1 rounded-full text-sm inline-flex items-center gap-1 bg-gray-200 text-[#001f3f]"
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tag.color }}
            ></span>
            {tag.name}
            <div className="relative group">
              <span
                className="px-2 py-0.5 rounded-full text-base cursor-pointer hover:text-red-400"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                const response = await fetch(`${API_URL}/notes/${note.id}/tags/${tag.id}`, {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                      }
                    });
                    if (response.ok) {
                      setTags(prev => prev.filter(t => t.id !== tag.id));
                    }
                  } catch (err) {
                    console.error("Error removing tag:", err);
                  }
                }}
              >
                ×
              </span>
              <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 text-xs text-white bg-black rounded hidden group-hover:flex whitespace-nowrap">
                Delete tag from note
              </span>
            </div>
          </span>
        ))}
        <button
          onClick={() => setShowTagSelector(!showTagSelector)}
          className="pl-3 pr-2 py-1 rounded-full text-sm inline-flex items-center gap-1 border-2 border-dashed border-blue-400 text-blue-400 hover:bg-blue-600"
          title="Add Tags"
        >
          <TagIcon className="w-4 h-4 text-blue-400" />
          Add Tag
        </button>
      </div>

      {showTagSelector && (
        <div className="mb-6 border border-gray-200 bg-white p-4 rounded shadow">
          <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md"
            onClick={async () => {
              try {
                for (const tag of selectedTags) {
                  await fetch(`${API_URL}/notes/${note.id}/tags/${tag.id}`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                  });
                }
                const tagsRes = await fetch(`${API_URL}/tags/${note.id}`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                  }
                });
                if (tagsRes.ok) {
                  const updatedTags = await tagsRes.json();
                  setTags(updatedTags);
                }
                setShowTagSelector(false);
                setSelectedTags([]);
              } catch (error) {
                console.error("Failed to save tags:", error);
                alert("Something went wrong while saving tags. Please try again.");
              }
            }}
          >
            Save Tags
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl space-y-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-[#001f3f] mb-2">
            <DocumentTextIcon className="w-6 h-6 inline-block mr-2 text-[#001f3f]" />
            Summary
          </h2>
          <div className="p-4 bg-gray-100 rounded-md border border-gray-200 text-gray-700 whitespace-pre-wrap">
            {note.summary}
          </div>
        </section>

        {note.action_items && (
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-[#001f3f] mb-2">
              <ClipboardDocumentListIcon className="w-6 h-6 inline-block mr-2 text-[#001f3f]" />
              Action Items
            </h2>
            <div className="p-4 bg-gray-100 rounded-md border border-gray-200 text-gray-700 whitespace-pre-wrap">
              <ul className="list-disc list-inside space-y-1">
                {note.action_items.split("\n").map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#001f3f] mb-2">
              <ChatBubbleLeftRightIcon className="w-6 h-6 inline-block mr-2 text-[#001f3f]" />
              Original Content
            </h2>
            <button
              className="text-xl text-[#001f3f] hover:text-blue-800 transition"
              onClick={() => setShowOriginal(!showOriginal)}
              title="Toggle Original Text"
            >
              {showOriginal ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
            </button>
          </div>
          {showOriginal && (
            isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-4 text-[#001f3f] rounded-md bg-white border border-gray-300 resize-y"
                  rows={10}
                />
                <ActionItemsToggle
                  includeActionItems={includeActionItems}
                  setIncludeActionItems={setIncludeActionItems}
                />
                <div className="space-x-4">
                  <button
                    onClick={async () => {
                      const res = await fetch(`${API_URL}/notes/${note.id}`, {
                        method: "PUT",
                        headers: { 
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({ content: editedContent, include_action_items: includeActionItems, updated_at: new Date().toISOString() }),
                      });
                      if (res.ok) {
                        const updated = await res.json();
                        setNote(updated);
                        setIsEditing(false);
                        setUpdateError(null);
                      } else {
                        const errorData = await res.json();
                        if (errorData.detail?.toLowerCase().includes("openai api key")) {
                          setUpdateError("Your OpenAI API key appears to be invalid or missing. Please check your profile settings.");
                        } else {
                          setUpdateError(errorData.detail || "Failed to update note.");
                        }
                      }
                    }}
                    className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition inline-flex items-center justify-center"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition inline-flex items-center justify-center"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                {updateError && (
                  <div className="mt-4 w-full max-w-2xl bg-red-100 text-red-700 border border-red-400 rounded-md px-4 py-3">
                    <strong className="font-semibold">Error:</strong> {updateError}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-100 rounded-md border border-gray-200 text-gray-700 whitespace-pre-wrap">
                  {note.content}
                </div>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditedContent(note.content);
                  }}
                  className="mt-4 px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
                >
                  Edit Original Text
                </button>
              </>
            )
          )}
        </section>
      </div>
      {(createdAt || lastModified) && (
        <div className="text-sm text-gray-600 mt-2 text-center">
          {createdAt && <p>Created At: {createdAt}</p>}
          {lastModified && <p>Last Modified: {lastModified}</p>}
        </div>
      )}
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p className="mb-2">
          <CurrencyDollarIcon className="w-5 h-5 inline-block mr-1" />
          Accumulated API Usage Statistics
        </p>
        <p>
          Input Tokens: <span className="text-gray-800">{inputTokens}</span>
        </p>
        <p>
          Output Tokens: <span className="text-gray-800">{outputTokens}</span>
        </p>
      </div>
    </main>
  );
}