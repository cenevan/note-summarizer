import React from "react";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState({ username: "", email: "", openai_api_key: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Account Profile</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-500 uppercase">Username</label>
              <div className="mt-1 text-lg text-gray-800">{user.username}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 uppercase">Email</label>
              <div className="mt-1 text-lg text-gray-800">{user.email}</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-1">Password</label>
            <div className="flex items-center gap-3">
              <span className="text-gray-800 text-lg">
                {showPassword ? "••••••••" : "********"}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
              >
                {showPassword ? "Hide" : "Reveal"}
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-1">OpenAI API Key</label>
            <div className="flex items-center gap-3">
              <span className="text-gray-800 text-lg break-all">
                {showApiKey
                  ? user.openai_api_key || "No key provided"
                  : "*".repeat(user.openai_api_key?.length || 10)}
              </span>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
              >
                {showApiKey ? "Hide" : "Reveal"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}