import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  noteId: number;
  name: string;
  summary: string;
  actionItems: string;
  onDelete: (noteId: number) => void;
  expandLink?: string;
}

const NoteCard: React.FC<Props> = ({
  noteId,
  name,
  summary,
  actionItems,
  onDelete,
  expandLink,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState(name);
  
  const changeName = async (editedName: string) => {
    const res = await fetch(`http://localhost:8000/notes/${noteId}/name`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editedName }),
    });
    if (res.ok) {
      setIsRenaming(false);
    } else {
      alert("Failed to rename note.");
    }
  }

  return (
    <div className="bg-gray-700 dark:bg-secondary p-6 rounded-lg shadow-md text-gray-900 dark:text-white font-sans transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col items-center">
        {isRenaming ? (
          <div className="flex items-center gap-2 mb-2">
            <input
              className="text-2xl font-bold text-primary leading-tight break-words bg-transparent border-b border-primary focus:outline-none text-center"
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
            <h3 className="text-2xl font-bold text-primary leading-tight break-words text-center">
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
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
        {expandLink ? (
          <Link
            to={expandLink}
            className="text-sm text-blue-400 hover:text-blue-600 transition"
          >
            + Expand
          </Link>
        ) : (
          <button
            className="text-sm text-blue-400 hover:text-blue-600 transition"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "− Collapse" : "+ Expand"}
          </button>
        )}

        <button
          onClick={() => onDelete(noteId)}
          className="text-sm text-red-400 hover:text-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;