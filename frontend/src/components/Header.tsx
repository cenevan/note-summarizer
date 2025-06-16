import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => (
  <header className="bg-gray-900/80 backdrop-blur-md text-white py-3 px-6 shadow-md border-b border-gray-800">
    <div className="flex justify-between items-center max-w-7xl mx-auto">
      <Link to="/" className="text-xl font-semibold tracking-wide text-white hover:text-primary transition-colors duration-300">
        🧠 Note AI
      </Link>
      <nav className="flex gap-2">
        <Link
          to="/upload"
          className="px-4 py-2 text-xl font-semibold border border-transparent text-white hover:border-white hover:bg-gray-800 rounded transition-colors"
        >
          Upload
        </Link>
        <Link
          to="/notes"
          className="px-4 py-2 text-xl font-semibold border border-transparent text-white hover:border-white hover:bg-gray-800 rounded transition-colors"
        >
          My Notes
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 text-xl font-semibold border border-transparent text-white hover:border-white hover:bg-gray-800 rounded transition-colors"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 text-xl font-semibold border border-transparent text-white hover:border-white hover:bg-gray-800 rounded transition-colors"
        >
          Sign Up
        </Link>
      </nav>
    </div>
  </header>
);

export default Header;