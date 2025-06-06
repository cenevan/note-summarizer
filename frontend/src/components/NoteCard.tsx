import React, { useState } from "react";

interface Props {
  noteId: number;
  filename: string;
  summary: string;
  actionItems: string;
  onDelete: (noteId: number) => void;
}

const NoteCard: React.FC<Props> = ({
  noteId,
  filename,
  summary,
  actionItems,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-700 dark:bg-secondary p-6 rounded-lg shadow-md text-gray-900 dark:text-white font-sans transition-all duration-300 hover:shadow-lg">
      <h3 className="text-2xl font-bold text-primary leading-tight mb-2 break-words">
        {filename}
      </h3>

      {expanded && (
        <div className="transition-all duration-300">
          <p className="underline uppercase text-sm text-accent font-semibold tracking-wide mb-1">
            Summary
          </p>
          <p className="mb-4">{summary}</p>

          <p className="underline uppercase text-sm text-accent font-semibold tracking-wide mb-1">
            Action Items
          </p>
          <ul className="list-disc list-inside space-y-1 mb-4">
            {actionItems.split("\n").map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
        <button
          className="text-sm text-blue-400 hover:text-blue-600 transition"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "− Collapse" : "+ Expand"}
        </button>

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