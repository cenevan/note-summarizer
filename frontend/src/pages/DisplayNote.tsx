import React, { useEffect, useState } from "react";
import TagSelector from "../components/TagSelector";
import { useParams, Link } from "react-router-dom";
import ActionItemsToggle from "../components/ActionItemsToggle";

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

  const changeName = async (editedName: string) => {
    if (!note) {
      console.error("Note is null, cannot change name");
      return;
    }
    const res = await fetch(`http://localhost:8000/notes/${note.id}/name`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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

    fetch(`http://localhost:8000/notes/${id}`)
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

        fetch(`http://localhost:8000/tags/${id}`)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-secondary to-gray-800 text-white p-8 font-sans flex flex-col items-center space-y-10">
      <div className="w-full max-w-4xl mb-4">
        <Link
          to="/notes"
          className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border border-blue-400 text-blue-400 hover:bg-blue-800 transition"
        >
          ← Back to My Notes
        </Link>
      </div>
      {isRenaming ? (
        <div className="flex justify-center items-center gap-2 mb-6">
          <input
            className="text-4xl font-bold text-primary bg-transparent border-b border-primary focus:outline-none text-center"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => changeName(editedName)}
            className="text-sm text-green-600 hover:text-green-800 px-4 py-2 bg-gray-700 rounded-md"
            title="Save Name"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-2 mb-6">
          <h1 className="text-4xl font-bold text-primary">{note.name}</h1>
          <button
            onClick={() => setIsRenaming(true)}
            className="text-sm text-accent hover:text-white"
            title="Rename Note"
          >
            ✏️
          </button>
        </div>
      )}

      <div className="max-w-3xl w-full flex flex-wrap justify-center gap-2">
        {tags.map(tag => (
          <span
            key={tag.id}
            className="pl-3 pr-2 py-1 rounded-full text-sm inline-flex items-center gap-1 text-white bg-gray-800"
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
                    const response = await fetch(`http://localhost:8000/notes/${note.id}/tags/${tag.id}`, {
                      method: "DELETE",
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
          className="pl-3 pr-2 py-1 rounded-full text-sm inline-flex items-center gap-1 border-2 border-dashed border-blue-400 text-blue-400 hover:bg-blue-800"
          title="Add Tags"
        >
          <span className="w-3 h-3 rounded-full bg-blue-400"></span>
          Add Tag
        </button>
      </div>

      {showTagSelector && (
        <div className="mb-6 border border-gray-400 bg-gray-800 p-4 rounded">
          <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md"
            onClick={async () => {
              try {
                for (const tag of selectedTags) {
                  await fetch(`http://localhost:8000/notes/${note.id}/tags/${tag.id}`, {
                    method: "POST",
                  });
                }
                const tagsRes = await fetch(`http://localhost:8000/tags/${note.id}`);
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

      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-2">Original Content</h2>
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-4 text-white rounded-md bg-gray-800 border border-gray-600 resize-y"
                rows={10}
              />
              <ActionItemsToggle
                includeActionItems={includeActionItems}
                setIncludeActionItems={setIncludeActionItems}
              />
              <div className="space-x-4">
                <button
                  onClick={async () => {
                    const res = await fetch(`http://localhost:8000/notes/${note.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: editedContent, include_action_items: includeActionItems, updated_at: new Date().toISOString() }),
                    });
                    if (res.ok) {
                      const updated = await res.json();
                      setNote(updated);
                      setIsEditing(false);
                    } else {
                      alert("Failed to update note.");
                    }
                  }}
                  className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 bg-gray-800 rounded-md border border-gray-600 text-gray-300 whitespace-pre-wrap">
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
          )}
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-2">Summary</h2>
          <div className="p-4 bg-gray-800 rounded-md border border-gray-600 text-gray-300 whitespace-pre-wrap">
            {note.summary}
          </div>
        </section>
        {note.action_items && (
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-2">Action Items</h2>
            <div className="p-4 bg-gray-800 rounded-md border border-gray-600 text-gray-300 whitespace-pre-wrap">
              <ul className="list-disc list-inside space-y-1">
                {note.action_items.split("\n").map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
      {(createdAt || lastModified) && (
        <div className="text-sm text-gray-400 mt-2 text-center">
          {createdAt && <p>Created At: {createdAt}</p>}
          {lastModified && <p>Last Modified: {lastModified}</p>}
        </div>
      )}
    </div>
  );
}