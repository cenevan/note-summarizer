import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
//import { ReactComponent as UserIcon } from "../assets/user.svg"; // assuming you place your icon in this path

const Header: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoggedIn) return;
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
        }
      }
    };
    fetchUser();
    setDropdownOpen(false);
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-900/80 backdrop-blur-md text-white py-3 px-6 shadow-md border-b border-gray-800">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-semibold tracking-wide text-white hover:text-primary transition-colors duration-300">
          🧠 Note AI
        </Link>
        <nav className="flex gap-2">
          {isLoggedIn ? (
            <>
              <Link to="/upload" className="px-4 py-2 text-xl font-semibold border border-transparent text-white hover:border-white hover:bg-gray-800 rounded transition-colors">
                Upload
              </Link>
              <Link to="/notes" className="px-4 py-2 text-xl font-semibold border border-transparent text-white hover:border-white hover:bg-gray-800 rounded transition-colors">
                My Notes
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-xl font-semibold text-white hover:bg-gray-800 rounded transition-colors"
                >
                  {/** <UserIcon className="w-6 h-6" /> **/}
                  {username}
                </button>
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg z-50 animate-fadeSlideDown"
                  >
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        setIsLoggedIn(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-xl font-semibold border border-transparent text-white hover:border-white hover:bg-gray-800 rounded transition-colors">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 text-xl font-semibold border border-transparent text-white hover:border-white hover:bg-gray-800 rounded transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;