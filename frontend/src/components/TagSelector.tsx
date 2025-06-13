import React, { useEffect, useState } from "react";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Props {
  noteId: number;
  selectedTags: Tag[];
  setSelectedTags: (tags: Tag[]) => void;
}

const TagSelector: React.FC<Props> = ({ noteId, selectedTags, setSelectedTags }) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/tags/")
      .then(response => response.json())
      .then(data => setAvailableTags(data))
      .catch(error => console.error("Error fetching tags:", error));
  }, []);

  const toggleTag = (tag: Tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
      // Optionally, implement tag removal logic here
    } else {
      fetch(`http://localhost:8000/notes/${noteId}/tags/${tag.id}`, {
        method: "POST",
      })
        .then(response => {
          if (!response.ok) throw new Error("Failed to assign tag");
          setSelectedTags([...selectedTags, tag]);
        })
        .catch(error => {
          console.error("Error assigning tag:", error);
        });
    }
  };

  const handleCreateTag = () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    console.log("Sending new tag to backend:", {
      name: trimmedName,
      color: "#D1D5DB",
    });

    fetch("http://localhost:8000/tags/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName, color: "#D1D5DB" }),
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
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTags.some(t => t.id === tag.id)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {tag.name}
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