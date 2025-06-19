import React from "react";
import { useEffect, useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

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
              <label className="block text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Username
              </label>
              <div className="mt-1 text-lg text-gray-800">{user.username}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                Email
              </label>
              <div className="mt-1 text-lg text-gray-800">{user.email}</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4" />
              Password
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-800 text-lg">
                {showPassword ? "••••••••" : "********"}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1"
              >
                {showPassword ? (
                  <>
                    <EyeSlashIcon className="w-4 h-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    Reveal
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
              <KeyIcon className="w-4 h-4" />
              OpenAI API Key
            </label>
            <div className="flex items-center gap-3">
              <span className="text-gray-800 text-lg break-all">
                {showApiKey
                  ? user.openai_api_key || "No key provided"
                  : "*".repeat(user.openai_api_key?.length || 10)}
              </span>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1"
              >
                {showApiKey ? (
                  <>
                    <EyeSlashIcon className="w-4 h-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    Reveal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}