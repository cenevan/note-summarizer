import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UploadPage from "./pages/UploadPage.tsx";
import MyNotes from "./pages/MyNotes.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <main className="min-h-screen bg-gray-500 dark:bg-secondary text-gray-900 dark:text-white flex flex-col items-center justify-center px-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
                📓 Welcome to AI Note Summarizer
              </h1>
              <p className="text-lg sm:text-xl text-accent text-center max-w-xl mb-8">
                Use AI to summarize your text notes and organize action items.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/upload"
                  className="px-6 py-3 bg-primary text-white rounded-md text-lg hover:bg-blue-700 transition"
                >
                  Upload a Note
                </Link>
                <Link
                  to="/notes"
                  className="px-6 py-3 border border-primary text-primary rounded-md text-lg hover:bg-gray-700 transition"
                >
                  View My Notes
                </Link>
              </div>
            </main>
          }
        />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/notes" element={<MyNotes />} />
      </Routes>
    </Router>
  );
}

export default App;