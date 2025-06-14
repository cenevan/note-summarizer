import React, { useEffect, useState } from "react";

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
    fetch("http://localhost:8000/tags/")
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

    fetch("http://localhost:8000/tags/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    <div>
      <label className="block text-sm font-medium mb-1">Tags</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {availableTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag)}
            className={`pl-3 pr-1 py-1 rounded-full text-sm inline-flex items-center gap-1 ${
              selectedTags.some(t => t.id === tag.id)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              ></span>
              {tag.name}
            </span>
            <span
              title="Delete tag"
              className="px-2 py-0.5 rounded-full text-base cursor-pointer hover:text-red-400"
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const response = await fetch(`http://localhost:8000/tags/${tag.id}`, {
                    method: "DELETE",
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
              &times;
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          value={newTagName}
          onChange={(e) => {
            setError(null);
            setNewTagName(e.target.value);
          }}
          placeholder="New tag name"
        />
        <input
          type="color"
          value={newTagColor}
          onChange={(e) => setNewTagColor(e.target.value)}
          className="w-10 h-10 p-0 border border-gray-300 rounded"
        />
        <button
          type="button"
          onClick={handleCreateTag}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Create Tag
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default TagSelector;