import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import NoteCard from "../components/NoteCard";
import TagSelector from "../components/TagSelector";
import {
  Bars3Icon,
  DocumentIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [createdOn, setCreatedOn] = useState<string>("");
  const [modifiedOn, setModifiedOn] = useState<string>("");
  const [filtering, setFiltering] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<"all" | "with" | "without">("all");
  const [sortOption, setSortOption] = useState<"oldest" | "newest" | "alpha">("newest");
  const [sortOpen, setSortOpen] = useState<boolean>(false);

  const [createdOpen, setCreatedOpen] = useState<boolean>(false);
  const [modifiedOpen, setModifiedOpen] = useState<boolean>(false);
  const [actionOpen, setActionOpen] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (searchQuery.trim() !== "") {
      // Search endpoint
      fetch(`${API_URL}/notes/search/?query=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((allNotes: Note[]) => {
          let filtered = allNotes;
          if (createdOn) {
            filtered = filtered.filter(n =>
              (() => {
                const d = new Date(n.created_at);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}` === createdOn;
              })()
            );
          }
          if (modifiedOn) {
            filtered = filtered.filter(n =>
              (() => {
                const d = new Date(n.updated_at);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}` === modifiedOn;
              })()
            );
          }
          // Filter by action items presence
          if (actionFilter === "with") {
            filtered = filtered.filter(n => n.action_items.trim().length > 0);
          } else if (actionFilter === "without") {
            filtered = filtered.filter(n => n.action_items.trim().length === 0);
          }
          // Apply sorting
          if (sortOption === "oldest") {
            filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          } else if (sortOption === "newest") {
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          } else if (sortOption === "alpha") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
          }
          setNotes(filtered);
        })
        .catch(() => console.error("Failed to search notes"));
    } else if (selectedTags.length > 0) {
      const query = selectedTags.map(tag => `tags=${encodeURIComponent(tag.name)}`).join("&");
      fetch(`${API_URL}/notes/tags/?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((allNotes: Note[]) => {
          let filtered = allNotes;
          if (createdOn) {
            filtered = filtered.filter(n =>
              (() => {
                const d = new Date(n.created_at);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}` === createdOn;
              })()
            );
          }
          if (modifiedOn) {
            filtered = filtered.filter(n =>
              (() => {
                const d = new Date(n.updated_at);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}` === modifiedOn;
              })()
            );
          }
          // Filter by action items presence
          if (actionFilter === "with") {
            filtered = filtered.filter(n => n.action_items.trim().length > 0);
          } else if (actionFilter === "without") {
            filtered = filtered.filter(n => n.action_items.trim().length === 0);
          }
          // Apply sorting
          if (sortOption === "oldest") {
            filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          } else if (sortOption === "newest") {
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          } else if (sortOption === "alpha") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
          }
          setNotes(filtered);
        })
        .catch(() => console.error("Failed to fetch tagged notes"));
    } else {
      fetch(`${API_URL}/notes/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then((allNotes: Note[]) => {
          let filtered = allNotes;
          if (createdOn) {
            filtered = filtered.filter(n =>
              (() => {
                const d = new Date(n.created_at);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}` === createdOn;
              })()
            );
          }
          if (modifiedOn) {
            filtered = filtered.filter(n =>
              (() => {
                const d = new Date(n.updated_at);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}` === modifiedOn;
              })()
            );
          }
          // Filter by action items presence
          if (actionFilter === "with") {
            filtered = filtered.filter(n => n.action_items.trim().length > 0);
          } else if (actionFilter === "without") {
            filtered = filtered.filter(n => n.action_items.trim().length === 0);
          }
          // Apply sorting
          if (sortOption === "oldest") {
            filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          } else if (sortOption === "newest") {
            filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          } else if (sortOption === "alpha") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
          }
          setNotes(filtered);
        })
        .catch(() => console.error("Failed to fetch notes"));
    }
  }, [searchQuery, selectedTags, createdOn, modifiedOn, actionFilter, sortOption]);

  const deleteNote = async (id: number) => {
    const res = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (res.ok) {
      setNotes(notes.filter(note => note.id !== id));
    } else {
      alert("Failed to delete note.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top AppBar */}
      <header className="bg-white shadow flex items-center px-4 py-2">
        <button className="p-2 hover:bg-gray-200 rounded-md" onClick={() => setSidebarOpen(prev => !prev)}>
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center ml-4">
          <DocumentIcon className="w-8 h-8 text-blue-600" />
          <span className="ml-2 font-semibold text-xl text-gray-800">My Notes</span>
        </div>
        <div className="ml-6 flex items-center bg-gray-100 rounded-lg px-3 py-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
          <input
            type="text"
            placeholder="Search your notes"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ml-2 bg-transparent focus:outline-none"
          />
        </div>
        <Link
          to="/upload"
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
        >
          <PlusCircleIcon className="w-5 h-5 mr-1" />
          New Note
        </Link>
      </header>

      <div className="flex h-screen overflow-visible">
        {/* Left Navigation Pane */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r h-full sticky top-0 p-4 overflow-visible relative z-10">
            {/* Sort Section */}
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Sort</h3>
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setSortOption("oldest")}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 ${
                  sortOption === "oldest" ? "bg-gray-200" : "bg-gray-100"
                }`}
              >
                Oldest
              </button>
              <button
                onClick={() => setSortOption("newest")}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 ${
                  sortOption === "newest" ? "bg-gray-200" : "bg-gray-100"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortOption("alpha")}
                className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-200 ${
                  sortOption === "alpha" ? "bg-gray-200" : "bg-gray-100"
                }`}
              >
                Name (A-Z)
              </button>
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Filters</h3>
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setFiltering(prev => !prev)}
                className="w-full text-left px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex justify-between items-center"
              >
                Tags 
                <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform ${filtering ? "rotate-180" : ""}`} />
              </button>
              <div
                className={`absolute top-full left-0 w-96 bg-white shadow-lg border border-gray-200 mt-1 rounded-md p-3 overflow-visible z-[10000] ${filtering ? "block" : "hidden"}`}
              >
                <TagSelector selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
              </div>
            </div>
            {/* Created On Dropdown */}
            <div className="relative mt-6">
              <button
                onClick={() => setCreatedOpen(prev => !prev)}
                className="w-full text-left px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex justify-between items-center"
              >
                Created On
                <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform ${createdOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-full left-0 w-full bg-white shadow-lg border border-gray-200 mt-1 rounded-md p-3 z-50 ${createdOpen ? "block" : "hidden"}`}>
                <input
                  type="date"
                  value={createdOn}
                  onChange={e => setCreatedOn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001f3f]"
                />
              </div>
            </div>
            {/* Last Modified Dropdown */}
            <div className="relative mt-6">
              <button
                onClick={() => setModifiedOpen(prev => !prev)}
                className="w-full text-left px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex justify-between items-center"
              >
                Last Modified
                <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform ${modifiedOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-full left-0 w-full bg-white shadow-lg border border-gray-200 mt-1 rounded-md p-3 z-50 ${modifiedOpen ? "block" : "hidden"}`}>
                <input
                  type="date"
                  value={modifiedOn}
                  onChange={e => setModifiedOn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#001f3f]"
                />
              </div>
            </div>
            {/* Action Items Dropdown */}
            <div className="relative mt-6">
              <button
                onClick={() => setActionOpen(prev => !prev)}
                className="w-full text-left px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex justify-between items-center"
              >
                {actionFilter === "all" ? "All Notes" : actionFilter === "with" ? "With Action Items" : "Without Action Items"}
                <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform ${actionOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute top-full left-0 w-full bg-white shadow-lg border border-gray-200 mt-1 rounded-md p-2 z-50 ${actionOpen ? "block" : "hidden"}`}>
                <button
                  onClick={() => { setActionFilter("all"); setActionOpen(false); }}
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                >
                  All Notes
                </button>
                <button
                  onClick={() => { setActionFilter("with"); setActionOpen(false); }}
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                >
                  With Action Items
                </button>
                <button
                  onClick={() => { setActionFilter("without"); setActionOpen(false); }}
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                >
                  Without Action Items
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto relative z-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.length === 0 ? (
              <div className="col-span-full text-center text-gray-600">
                No notes found. Create or search to get started.
              </div>
            ) : notes.map(note => (
              <NoteCard
                key={note.id}
                noteId={note.id}
                name={note.name}
                summary={note.summary}
                actionItems={note.action_items}
                onDelete={deleteNote}
                expandLink={`/notes/${note.id}`}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}