import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UploadPage from "./pages/UploadPage.tsx";
import MyNotes from "./pages/MyNotes.tsx";
import DisplayNote from "./pages/DisplayNote.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <main className="min-h-screen bg-gradient-to-br from-gray-900 via-secondary to-gray-800 text-white flex flex-col items-center justify-center px-6 py-10 space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-primary drop-shadow-lg">
                  📓 AI Note Summarizer
                </h1>
                <p className="text-xl sm:text-2xl text-accent max-w-2xl mx-auto">
                  Use AI to transform raw notes into concise summaries and actionable insights.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/upload"
                  className="relative px-6 py-3 bg-primary text-white font-medium rounded-full text-lg shadow-md hover:bg-blue-600 transition before:absolute before:inset-0 before:-z-10 before:rounded-full before:blur-md before:bg-yellow-400"
                >
                  Upload a Note
                </Link>
                <Link
                  to="/notes"
                  className="px-6 py-3 border-2 border-primary text-primary rounded-full text-lg font-medium hover:bg-primary hover:text-white transition"
                >
                  View My Notes
                </Link>
              </div>

              <div className="mt-12 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder components for future enhancements */}
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                  <h2 className="text-xl font-semibold mb-2">📌 Recent Summaries</h2>
                  <p className="text-sm text-gray-300">See your most recently uploaded and summarized notes.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                  <h2 className="text-xl font-semibold mb-2">🧠 Smart Suggestions</h2>
                  <p className="text-sm text-gray-300">Let AI recommend actions or follow-ups based on your notes.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                  <h2 className="text-xl font-semibold mb-2">📂 Draft Notes</h2>
                  <p className="text-sm text-gray-300">Access drafts you’re currently working on or editing.</p>
                </div>
              </div>
            </main>
          }
        />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/notes" element={<MyNotes />} />
        <Route path="/notes/:id" element={<DisplayNote />} />
      </Routes>
    </Router>
  );
}

export default App;