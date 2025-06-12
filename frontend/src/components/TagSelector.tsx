import React, { useEffect, useState } from "react";

interface Tag {
  id: number;
  name: string;
  color: string;
}

interface Props {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const TagSelector: React.FC<Props> = ({ selectedTags, setSelectedTags }) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/tags/")
      .then(response => response.json())
      .then(data => setAvailableTags(data))
      .catch(error => console.error("Error fetching tags:", error));
  }, []);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(tag => tag !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    console.log("Sending new tag to backend:", {
        name: newTagName,
        color: "#D1D5DB",
    });

    fetch("http://localhost:8000/tags/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newTagName, color: "#D1D5DB" }),
    })
      .then(response => response.json())
      .then(data => {
        setAvailableTags([...availableTags, data]);
        setNewTagName("");
      })
      .catch(error => console.error("Error creating tag:", error));
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Tags</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {availableTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.name)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTags.includes(tag.name)
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
          onChange={(e) => setNewTagName(e.target.value)}
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
    </div>
  );
};

export default TagSelector;