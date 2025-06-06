import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Result {
  summary: string;
  action_items: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white text-center p-8 font-sans flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-primary mb-4">📝 Upload a Note</h1>

      <div className="mb-6 space-x-4">
        <Link to="/" className="text-blue-400 hover:underline">← Back to Home</Link>
        <Link to="/notes" className="text-blue-400 hover:underline">View My Notes</Link>
      </div>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="inline-block cursor-pointer px-4 py-2 bg-gray-800 text-white border border-gray-500 rounded-md hover:bg-gray-700"
        >
          📁 Select a Note File
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        {file && <p className="mt-2 text-sm text-gray-300">Selected file: {file.name}</p>}
      </div>
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`px-6 py-2 rounded-md text-white transition ${
          loading || !file
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-300 hover:bg-blue-700"
        }`}
      >
        {loading ? "Summarizing..." : "Upload & Summarize"}
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-8 max-w-xl">
          <h2 className="text-2xl font-semibold mb-2">📄 Summary</h2>
          <p className="mb-6">{result.summary}</p>

          <h2 className="text-2xl font-semibold mb-2">✅ Action Items</h2>
          <ul className="list-disc list-inside text-left space-y-1">
            {result.action_items.split("\n").map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}