import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Props {
  noteId: number;
  name: string;
  summary: string;
  actionItems: string;
  tagsProp?: Tag[];
  onDelete: (noteId: number) => void;
  expandLink?: string;
}

const NoteCard: React.FC<Props> = ({
  noteId,
  name,
  summary,
  actionItems,
  tagsProp,
  onDelete,
  expandLink,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [tags, setTags] = useState<Tag[]>([]);
  const [lastModified, setLastModified] = useState<string | null>(null);

  useEffect(() => {
    console.log("NoteCard useEffect triggered");
    if (tagsProp) {
      console.log("Using provided tags prop:", tagsProp);
      setTags(tagsProp);
    } else {
      console.log("Fetching tags for noteId:", noteId);
      fetch(`http://localhost:8000/tags/${noteId}`)
        .then(res => res.json())
        .then(data => setTags(data))
        .catch(err => console.error("Failed to fetch tags", err));
    }
  }, [noteId, tagsProp]);

  useEffect(() => {
    fetch(`http://localhost:8000/notes/${noteId}`)
      .then(res => res.json())
      .then(data => {
        if (data.updated_at) {
          setLastModified(new Date(data.updated_at).toLocaleString());
        }
      })
      .catch(err => console.error("Failed to fetch note metadata", err));
  }, [noteId]);

  const changeName = async (editedName: string) => {
    const res = await fetch(`http://localhost:8000/notes/${noteId}/name`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editedName, updated_at: new Date().toISOString() }),
    });
    if (res.ok) {
      setIsRenaming(false);
    } else {
      alert("Failed to rename note.");
    }
  }

    // Helper to format date without seconds
  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg text-white font-sans transition-all duration-300 hover:shadow-xl h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col items-center">
          {isRenaming ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                className="text-xl font-bold text-primary leading-tight bg-transparent border-b border-primary focus:outline-none text-center w-48"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                autoFocus
              />
              <button
                onClick={() => changeName(editedName)}
                className="text-sm text-green-600 hover:text-green-800 px-4 py-2 bg-gray-800 rounded-md"
                title="Save Name"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-primary leading-tight break-words text-center max-w-full overflow-hidden text-ellipsis whitespace-normal">
                {editedName}
              </h3>
              <button
                onClick={() => setIsRenaming(true)}
                className="text-sm text-accent hover:text-white"
                title="Rename Note"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="pl-3 pr-2 py-1 rounded-full text-sm inline-flex items-center gap-1 border border-gray-600 bg-gray-700 text-white"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                ></span>
                {tag.name}
                <span
                  title="Delete tag from note"
                  className="px-2 py-0.5 rounded-full text-base cursor-pointer hover:text-red-400"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const response = await fetch(`http://localhost:8000/notes/${noteId}/tags/${tag.id}`, {
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
              </span>
            ))}
          </div>
        )}
        {lastModified && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Last Modified: {formatDateTime(lastModified)}
          </p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
        {expandLink ? (
          <Link
            to={expandLink}
            className="text-sm px-3 py-1 rounded-md border border-blue-400 text-blue-400 hover:bg-blue-800 transition"
          >
            + Expand
          </Link>
        ) : (
          <button
            className="text-sm px-3 py-1 rounded-md border border-blue-400 text-blue-400 hover:bg-blue-800 transition"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "− Collapse" : "+ Expand"}
          </button>
        )}

        <button
          onClick={() => onDelete(noteId)}
          className="text-sm px-3 py-1 rounded-md border border-red-400 text-red-400 hover:bg-red-800 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;