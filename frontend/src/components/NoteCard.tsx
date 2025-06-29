import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PencilSquareIcon, TrashIcon, CheckIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import {
  Menu,
  Transition,
  MenuButton,
  MenuItems,
  MenuItem
} from "@headlessui/react";
import TagSelector from "./TagSelector";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
  const navigate = useNavigate();
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [tags, setTags] = useState<Tag[]>([]);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [noteMetadata, setNoteMetadata] = useState<any | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [flipPopup, setFlipPopup] = useState<boolean>(false);
  useEffect(() => {
    if ((showTagSelector || showProperties) && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const popupWidth = 384; // matches w-96
      setFlipPopup(window.innerWidth - rect.right < popupWidth);
    }
  }, [showTagSelector, showProperties]);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowProperties(false);
        setShowTagSelector(false);
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data.username || null);
      })
      .catch(err => console.error("Failed to fetch user info", err));
  }, []);

  useEffect(() => {
    console.log("NoteCard useEffect triggered");
    if (tagsProp) {
      console.log("Using provided tags prop:", tagsProp);
      setTags(tagsProp);
    } else {
      console.log("Fetching tags for noteId:", noteId);
      fetch(`${API_URL}/tags/${noteId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
        .then(res => res.json())
        .then(data => setTags(data))
        .catch(err => console.error("Failed to fetch tags", err));
    }
  }, [noteId, tagsProp]);

  useEffect(() => {
    fetch(`${API_URL}/notes/${noteId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.updated_at) {
          setLastModified(new Date(data.updated_at).toLocaleString());
          setNoteMetadata(data);
        }
      })
      .catch(err => console.error("Failed to fetch note metadata", err));
  }, [noteId]);

  const changeName = async (editedName: string) => {
    const res = await fetch(`${API_URL}/notes/${noteId}/name`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
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

  const cardContent = (
    <div className="relative z-0 h-full bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-md text-[#001f3f] font-sans transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer flex flex-col justify-between">
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
                onClick={(e) => { e.stopPropagation(); changeName(editedName); }}
                className="text-sm px-3 py-1 rounded-md border border-green-400 text-green-400 hover:bg-green-800 transition"
                title="Save Name"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-primary leading-tight break-words text-center max-w-full overflow-hidden text-ellipsis whitespace-normal">
                {editedName}
              </h3>
              <button
                onClick={(e) => { e.stopPropagation(); setIsRenaming(true); }}
                className="text-sm text-accent hover:text-white"
                title="Rename Note"
              >
                <PencilSquareIcon className="w-5 h-5 text-accent hover:text-gray-500" />
              </button>
            </div>
          )}
        </div>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="pl-3 pr-2 py-1 rounded-full text-sm inline-flex items-center gap-1 border border-gray-200 bg-gray-200 text-gray-600"
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
                      const response = await fetch(`${API_URL}/notes/${noteId}/tags/${tag.id}`, {
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
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(noteId); }}
          className="text-sm px-3 py-1 rounded-md border border-red-400 text-red-400 hover:bg-red-600 transition"
        >
          <TrashIcon className="w-4 h-4 inline mr-1" />
          <span>Delete</span>
        </button>
        <div className="relative self-end">
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton
              onClick={(e) => { e.stopPropagation(); setShowMenu(prev => !prev); }}
              className="text-gray-700 hover:text-gray-500"
            >
              <EllipsisVerticalIcon className="w-6 h-6" />
            </MenuButton>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 top-full mt-2 w-48 origin-top-right bg-gray-900 border border-gray-700 divide-y divide-gray-600 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999]">
                <div className="px-1 py-1">
                  <MenuItem
                    as="button"
                    onClick={(e) => { e.stopPropagation(); setShowTagSelector(prev => !prev); }}
                    className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-white z-[9999] hover:bg-gray-700"
                  >
                    Add Tag
                  </MenuItem>
                  <MenuItem
                    as="button"
                    onClick={(e) => { e.stopPropagation(); setShowProperties(prev => !prev); }}
                    className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-white z-[9999] hover:bg-gray-700"
                  >
                    Properties
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );

  return expandLink ? (
    <div
      className={`relative h-full flex flex-col ${(showProperties || showTagSelector || showMenu) ? 'z-[10000]' : 'z-10'}`}
      ref={cardRef}
    >
      <div
        className="h-full flex flex-col"
        onClick={() => {
          setShowTagSelector(false);
          setShowProperties(false);
          navigate(expandLink);
        }}
      >
        {cardContent}
      </div>
      {showProperties && noteMetadata && (
        <div className={`absolute top-0 ${flipPopup ? 'right-full mr-2' : 'left-full ml-2'} w-96 bg-white border border-gray-200 rounded-lg shadow-md z-[9999]`}>
          <div className="p-4 text-sm text-[#001f3f]">
            <p><strong>Creator:</strong> {currentUser || "N/A"}</p>
            <p><strong>Created At:</strong> {formatDateTime(noteMetadata.created_at)}</p>
            <p><strong>Updated At:</strong> {formatDateTime(noteMetadata.updated_at)}</p>
            <p><strong>Action Items Enabled:</strong> {noteMetadata.action_items?.trim() ? "Yes" : "No"}</p>
          </div>
        </div>
      )}
      {showTagSelector && (
        <div className={`absolute top-0 ${flipPopup ? 'right-full mr-2' : 'left-full ml-2'} w-96 bg-white border border-gray-200 rounded-lg shadow-md z-[9999]`}>
          <div className="p-4 text-[#001f3f]">
            <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
            <div className="flex justify-center mt-2">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await Promise.all(selectedTags.map(tag =>
                      fetch(`${API_URL}/notes/${noteId}/tags/${tag.id}`, {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                      })
                    ));
                    const updated = await fetch(`${API_URL}/tags/${noteId}`, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                      }
                    });
                    const updatedTags = await updated.json();
                    setTags(updatedTags);
                    setShowTagSelector(false);
                  } catch (err) {
                    console.error("Error assigning tags:", err);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div
      className={`relative h-full flex flex-col ${(showProperties || showTagSelector || showMenu) ? 'z-[10000]' : 'z-10'}`}
      ref={cardRef}
    >
      <div className="h-full flex flex-col">
        {cardContent}
      </div>
      {showProperties && noteMetadata && (
        <div className={`absolute top-0 ${flipPopup ? 'right-full mr-2' : 'left-full ml-2'} w-96 bg-white border border-gray-200 rounded-lg shadow-md z-[9999]`}>
          <div className="p-4 text-sm text-[#001f3f]">
            <p><strong>Creator:</strong> {currentUser || "N/A"}</p>
            <p><strong>Created At:</strong> {formatDateTime(noteMetadata.created_at)}</p>
            <p><strong>Updated At:</strong> {formatDateTime(noteMetadata.updated_at)}</p>
            <p><strong>Action Items Enabled:</strong> {noteMetadata.action_items?.trim() ? "Yes" : "No"}</p>
          </div>
        </div>
      )}
      {showTagSelector && (
        <div className={`absolute top-0 ${flipPopup ? 'right-full mr-2' : 'left-full ml-2'} w-96 bg-white border border-gray-200 rounded-lg shadow-md z-[9999]`}>
          <div className="p-4 text-[#001f3f]">
            <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
            <div className="flex justify-center mt-2">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await Promise.all(selectedTags.map(tag =>
                      fetch(`${API_URL}/notes/${noteId}/tags/${tag.id}`, {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`
                        }
                      })
                    ));
                    const updated = await fetch(`${API_URL}/tags/${noteId}`, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                      }
                    });
                    const updatedTags = await updated.json();
                    setTags(updatedTags);
                    setShowTagSelector(false);
                  } catch (err) {
                    console.error("Error assigning tags:", err);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteCard;