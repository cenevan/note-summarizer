import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  EnvelopeIcon,
  UserIcon,
  LockClosedIcon,
  KeyIcon,
  ArrowRightCircleIcon
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const response = await fetch(`${API_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username,
        password,
        openai_api_key: openaiKey || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.detail || "Signup failed. Please try again.");
      setIsLoading(false);
      return;
    }

    setError(null);
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      setIsLoggedIn(true);
      setIsLoading(false);
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <label className="block mb-2 font-medium flex items-center gap-2">
          <EnvelopeIcon className="w-5 h-5" />
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <label className="block mb-2 font-medium flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <label className="block mb-2 font-medium flex items-center gap-2">
          <LockClosedIcon className="w-5 h-5" />
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <label className="block mb-2 font-medium flex items-center gap-2">
          <LockClosedIcon className="w-5 h-5" />
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <label className="block mb-2 font-medium flex items-center gap-2">
          <KeyIcon className="w-5 h-5" />
          OpenAI API Key (optional)
        </label>
        <input
          type="text"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-6"
        />

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : (
            <>
              <ArrowRightCircleIcon className="w-5 h-5" />
              Sign Up
            </>
          )}
        </button>
      </form>
    </div>
  );
}