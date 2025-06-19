import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage.tsx";
import MyNotes from "./pages/MyNotes.tsx";
import DisplayNote from "./pages/DisplayNote.tsx";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SignupPage from "./pages/SignUpPage.tsx";
import Profile from "./pages/Profile";
import {
  ArrowUpTrayIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  LightBulbIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

function App() {
  const { isLoggedIn, isAuthInitialized } = useAuth();
  if (!isAuthInitialized) return null;
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
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
                    className="px-6 py-3 bg-primary text-white border border-blue-400 rounded-full text-lg font-medium hover:bg-blue-600 transition flex items-center gap-2 justify-center"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    Upload a Note
                  </Link>
                  <Link
                    to="/notes"
                    className="px-6 py-3 border-2 border-primary text-primary rounded-full text-lg font-medium hover:bg-gray-600 hover:text-white transition flex items-center gap-2 justify-center"
                  >
                    <ClipboardDocumentListIcon className="w-5 h-5" />
                    View My Notes
                  </Link>
                </div>

                <div className="mt-12 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Placeholder components for future enhancements */}
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-primary" />
                      Recent Summaries
                    </h2>
                    <p className="text-sm text-gray-300">See your most recently uploaded and summarized notes.</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <LightBulbIcon className="w-5 h-5 text-primary" />
                      Smart Suggestions
                    </h2>
                    <p className="text-sm text-gray-300">Let AI recommend actions or follow-ups based on your notes.</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-lg">
                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      <PencilSquareIcon className="w-5 h-5 text-primary" />
                      Draft Notes
                    </h2>
                    <p className="text-sm text-gray-300">Access drafts you’re currently working on or editing.</p>
                  </div>
                </div>
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/upload"
          element={
            isAuthInitialized && isLoggedIn ? (
              <>
                <Header />
                <UploadPage />
                <Footer />
              </>
            ) : (
              isAuthInitialized && <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notes"
          element={
            isAuthInitialized && isLoggedIn ? (
              <>
                <Header />
                <MyNotes />
                <Footer />
              </>
            ) : (
              isAuthInitialized && <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/notes/:id"
          element={
            <>
              <Header />
              <DisplayNote />
              <Footer />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            isAuthInitialized && isLoggedIn ? (
              <>
                <Header />
                <Profile />
                <Footer />
              </>
            ) : (
              isAuthInitialized && <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Header />
              <LoginPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Header />
              <SignupPage />
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;