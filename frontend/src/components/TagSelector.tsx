import React, { useEffect, useState } from "react";
import {
  TagIcon,
  TrashIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Props {
  selectedTags: Tag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}

const TagSelector: React.FC<Props> = ({ selectedTags, setSelectedTags }) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#D1D5DB");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/tags/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(response => response.json())
      .then(data => setAvailableTags(data))
      .catch(error => console.error("Error fetching tags:", error));
  }, []);

  useEffect(() => {
    setSelectedTags([]);
  }, []);

  const toggleTag = (tag: Tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCreateTag = () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    console.log("Sending new tag to backend:", {
      name: trimmedName,
      color: newTagColor,
    });

    fetch(`${API_URL}/tags/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ name: trimmedName, color: newTagColor }),
    })
      .then(async response => {
        if (!response.ok) {
          const err = await response.json();
          setError(err.detail || "Error creating tag");
          return;
        }
        const data = await response.json();
        setAvailableTags([...availableTags, data]);
        setNewTagName("");
        setError(null);
      })
      .catch(error => {
        console.error("Error creating tag:", error);
        setError("Error creating tag");
      });
  };

  return (
    <div className="flex flex-col items-center text-center w-full max-w-md mx-auto">
      <label className="block text-sm font-medium mb-2 flex items-center gap-2 justify-center text-gray-700">
        <TagIcon className="w-5 h-5 text-primary" />
        <span className="text-lg font-semibold">Tags</span>
      </label>
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {availableTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag)}
            className={`pl-3 pr-2 py-1 rounded-full text-sm inline-flex items-center gap-2 border transition-all duration-200 ${
              selectedTags.some(t => t.id === tag.id)
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: tag.color }}
              ></span>
              {tag.name}
            </span>
            <span
              title="Delete tag"
              className="px-1 py-0.5 rounded-full text-base cursor-pointer hover:text-red-500"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const response = await fetch(`${API_URL}/tags/${tag.id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                  });
                  if (response.ok) {
                    setAvailableTags(prev => prev.filter(t => t.id !== tag.id));
                    setSelectedTags(prev => prev.filter(t => t.id !== tag.id));
                  }
                } catch (err) {
                  console.error("Error deleting tag:", err);
                }
              }}
            >
              <TrashIcon className="w-4 h-4 text-gray-600 hover:text-red-500 transition" />
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-center items-center w-full">
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={newTagName}
          onChange={(e) => {
            setError(null);
            setNewTagName(e.target.value);
          }}
          placeholder="New tag name"
        />
        <label className="flex items-center text-sm">
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-8 h-8 cursor-pointer border-0 rounded-none"
          />
        </label>
        <button
          type="button"
          onClick={handleCreateTag}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 transition-all"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span>Create</span>
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-3 animate-fadeIn">{error}</p>
      )}
    </div>
  );
};

export default TagSelector;