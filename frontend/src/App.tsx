import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UploadPage from "./pages/UploadPage.tsx";
import MyNotes from "./pages/MyNotes.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div style={{ textAlign: "center", marginTop: "4rem", fontFamily: "Arial, sans-serif" }}>
            <h1>📓 Welcome to AI Note Summarizer</h1>
            <p>Use AI to summarize your text notes and organize action items.</p>
            <div style={{ marginTop: "2rem" }}>
              <Link to="/upload" style={{ marginRight: "2rem", fontSize: "1.2rem" }}>Upload a Note</Link>
              <Link to="/notes" style={{ fontSize: "1.2rem" }}>View My Notes</Link>
            </div>
          </div>
        } />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/notes" element={<MyNotes />} />
      </Routes>
    </Router>
  );
}

export default App;