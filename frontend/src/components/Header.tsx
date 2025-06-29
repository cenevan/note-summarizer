import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Header: React.FC = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoggedIn) return;
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch(`${API_URL}/users/me`, {
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

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={hideHeader ? { y: -100, opacity: 0 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-gradient-to-r from-[#001f3f] to-[#004080] text-white py-4 px-8 shadow-xl"
    >
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="text-2xl font-bold tracking-tight text-white">
            🧠 <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-400">SmartNotes</span>
          </Link>
        </motion.div>
        <nav className="flex gap-2">
          {isLoggedIn ? (
            <>
              <Link to="/upload" className="relative px-4 py-2 text-lg font-medium text-white flex items-center overflow-hidden">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="z-10 flex items-center"
                >
                  <ArrowUpTrayIcon className="w-5 h-5 mr-2" />Upload
                </motion.div>
                <motion.span
                  className="absolute left-0 bottom-0 h-0.5 bg-white"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <Link to="/notes" className="relative px-4 py-2 text-lg font-medium text-white flex items-center overflow-hidden">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="z-10 flex items-center"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />My Notes
                </motion.div>
                <motion.span
                  className="absolute left-0 bottom-0 h-0.5 bg-white"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative px-4 py-2 text-lg font-medium text-white flex items-center gap-2 overflow-hidden"
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="z-10 flex items-center gap-2"
                  >
                    <UserCircleIcon className="w-6 h-6" />
                    {username}
                  </motion.div>
                  <motion.span
                    className="absolute left-0 bottom-0 h-0.5 bg-white"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg shadow-lg z-50"
                  >
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg flex items-center"
                    >
                      <Cog6ToothIcon className="w-5 h-5 mr-2 inline" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        setIsLoggedIn(false);
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg flex items-center"
                    >
                      <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2 inline" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="relative px-4 py-2 text-lg font-medium text-white flex items-center overflow-hidden">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="z-10 flex items-center"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                  Login
                </motion.div>
                <motion.span
                  className="absolute left-0 bottom-0 h-0.5 bg-white"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <Link to="/signup" className="relative px-4 py-2 text-lg font-medium text-white flex items-center overflow-hidden">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="z-10 flex items-center"
                >
                  <UserCircleIcon className="w-5 h-5 mr-2" />
                  Sign Up
                </motion.div>
                <motion.span
                  className="absolute left-0 bottom-0 h-0.5 bg-white"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}

export default Header;