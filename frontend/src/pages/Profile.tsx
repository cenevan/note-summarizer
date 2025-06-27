import React from "react";
import { useEffect, useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Profile() {
  const [user, setUser] = useState({ username: "", email: "", openai_api_key: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editing, setEditing] = useState({
    username: false,
    email: false,
    password: false,
    apiKey: false,
  });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    apiKey: "",
    currentPassword: "",
    newPassword: "",
  });
  const [feedback, setFeedback] = useState({
    username: "",
    email: "",
    password: "",
    apiKey: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        const res = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setFormData({
            username: data.username,
            email: data.email,
            apiKey: data.openai_api_key,
            currentPassword: "",
            newPassword: "",
          });
        }
      }
    };
    fetchUser();
  }, [token]);

  const handleEditToggle = (field: keyof typeof editing) => {
    setFeedback(prev => ({ ...prev, [field]: "" }));
    if (editing[field]) {
      // Cancel editing: reset formData field to user data
      if (field === "username") setFormData(prev => ({ ...prev, username: user.username }));
      else if (field === "email") setFormData(prev => ({ ...prev, email: user.email }));
      else if (field === "apiKey") setFormData(prev => ({ ...prev, apiKey: user.openai_api_key }));
      else if (field === "password") setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
    }
    setEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateField = async (field: keyof typeof editing) => {
    if (!token) return;
    setFeedback(prev => ({ ...prev, [field]: "" }));

    let url = "";
    let body: any = {};
    let successMsg = "Updated successfully.";
    if (field === "username") {
      url = "http://localhost:8000/users/me/username";
      body = { new_username: formData.username };
      if (!formData.username.trim()) {
        setFeedback(prev => ({ ...prev, username: "Username cannot be empty." }));
        return;
      }
    } else if (field === "email") {
      url = "http://localhost:8000/users/me/email";
      body = { new_email: formData.email };
      if (!formData.email.trim()) {
        setFeedback(prev => ({ ...prev, email: "Email cannot be empty." }));
        return;
      }
    } else if (field === "password") {
      url = "http://localhost:8000/users/me/password";
      body = { old_password: formData.currentPassword,
        new_password: formData.newPassword };
      if (!formData.currentPassword) {
        setFeedback(prev => ({ ...prev, password: "Current password is required." }));
        return;
      }
      if (!formData.newPassword) {
        setFeedback(prev => ({ ...prev, password: "New password cannot be empty." }));
        return;
      }
    } else if (field === "apiKey") {
      url = "http://localhost:8000/users/me/api-key";
      body = { new_key: formData.apiKey };
      // apiKey can be empty (to remove)
    }

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        // Parse response and store new access_token if present (for username/email update)
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }
        // Use the latest token for fetching user info
        const refreshed = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || token}`,
          },
        });
        if (refreshed.ok) {
          const updatedUser = await refreshed.json();
          setUser(updatedUser);
          setFormData({
            username: updatedUser.username,
            email: updatedUser.email,
            apiKey: updatedUser.openai_api_key,
            currentPassword: "",
            newPassword: "",
          });
        }
        setEditing(prev => ({ ...prev, [field]: false }));
        const message = field === "password" ? "Password updated successfully." : successMsg;
        setFeedback(prev => ({ ...prev, [field]: message }));
        console.log("Feedback set for", field, ":", message);
        setTimeout(() => {
          setFeedback(prev => ({ ...prev, [field]: "" }));
        }, 3000);
      } else {
        const data = await res.json();
        setFeedback(prev => ({ ...prev, [field]: data.detail || "Update failed." }));
      }
    } catch {
      setFeedback(prev => ({ ...prev, [field]: "Network error." }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {feedback.username === "Updated successfully." && (
        <div className="mb-6 px-4 py-3 rounded-md bg-green-100 text-green-800 border border-green-300 text-center font-medium shadow-sm">
          Username updated successfully.
        </div>
      )}
      {feedback.email === "Updated successfully." && (
        <div className="mb-6 px-4 py-3 rounded-md bg-green-100 text-green-800 border border-green-300 text-center font-medium shadow-sm">
          Email updated successfully.
        </div>
      )}
      {feedback.apiKey === "Updated successfully." && (
        <div className="mb-6 px-4 py-3 rounded-md bg-green-100 text-green-800 border border-green-300 text-center font-medium shadow-sm">
          API Key updated successfully.
        </div>
      )}
      {feedback.password === "Password updated successfully." && (
        <div className="mb-6 px-4 py-3 rounded-md bg-green-100 text-green-800 border border-green-300 text-center font-medium shadow-sm">
          Password updated successfully.
        </div>
      )}
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Account Profile</h1>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-1">
                <UserIcon className="w-4 h-4" />
                Username
                {!editing.username && (
                  <button
                    onClick={() => handleEditToggle("username")}
                    aria-label="Edit username"
                    className="ml-auto text-gray-400 hover:text-blue-600 transition"
                    type="button"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                )}
              </label>
            {editing.username ? (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => updateField("username")}
                      className="text-green-600 hover:text-green-800"
                      aria-label="Save username"
                      type="button"
                    >
                      <CheckIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleEditToggle("username")}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Cancel editing username"
                      type="button"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  {feedback.username && feedback.username !== "Updated successfully." && (
                    <p className="mt-1 text-sm text-red-600">{feedback.username}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="mt-1 text-lg text-gray-800">{user.username}</div>
                  {feedback.username && feedback.username !== "Updated successfully." && (
                    <p className="mt-1 text-sm text-red-600">{feedback.username}</p>
                  )}
                </>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-1">
                <EnvelopeIcon className="w-4 h-4" />
                Email
                {!editing.email && (
                  <button
                    onClick={() => handleEditToggle("email")}
                    aria-label="Edit email"
                    className="ml-auto text-gray-400 hover:text-blue-600 transition"
                    type="button"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                )}
              </label>
            {editing.email ? (
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => updateField("email")}
                      className="text-green-600 hover:text-green-800"
                      aria-label="Save email"
                      type="button"
                    >
                      <CheckIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleEditToggle("email")}
                      className="text-red-600 hover:text-red-800"
                      aria-label="Cancel editing email"
                      type="button"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  {feedback.email && feedback.email !== "Updated successfully." && (
                    <p className="mt-1 text-sm text-red-600">{feedback.email}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="mt-1 text-lg text-gray-800">{user.email}</div>
                  {feedback.email && feedback.email !== "Updated successfully." && (
                    <p className="mt-1 text-sm text-red-600">{feedback.email}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4" />
              Change Password
              {!editing.password && (
                <button
                  onClick={() => handleEditToggle("password")}
                  aria-label="Edit password"
                  className="ml-auto text-gray-400 hover:text-blue-600 transition"
                  type="button"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
              )}
            </label>
            {editing.password ? (
              <div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1" htmlFor="currentPassword">
                      Current Password
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => handleChange("currentPassword", e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1"
                        type="button"
                      >
                        {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-600 mb-1" htmlFor="newPassword">
                      New Password
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => handleChange("newPassword", e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1"
                        type="button"
                      >
                        {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => updateField("password")}
                        className="text-green-600 hover:text-green-800"
                        aria-label="Save password"
                        type="button"
                      >
                        <CheckIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleEditToggle("password")}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Cancel editing password"
                        type="button"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
                {feedback.password && feedback.password !== "Password updated successfully." && (
                  <p className="mt-1 text-sm text-red-600">{feedback.password}</p>
                )}
              </div>
            ) : (
              <div>
                {feedback.password && feedback.password !== "Password updated successfully." && (
                  <p className="mt-1 text-sm text-red-600">{feedback.password}</p>
                )}
              </div>
            )}
          </div>

          {/* OpenAI API Key */}
          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-1 flex items-center gap-2">
              <KeyIcon className="w-4 h-4" />
              OpenAI API Key
              {!editing.apiKey && (
                <button
                  onClick={() => handleEditToggle("apiKey")}
                  aria-label="Edit OpenAI API Key"
                  className="ml-auto text-gray-400 hover:text-blue-600 transition"
                  type="button"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
              )}
            </label>
            {editing.apiKey ? (
              <div>
                <div className="flex items-center gap-3">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={formData.apiKey}
                    onChange={(e) => handleChange("apiKey", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 break-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1"
                    type="button"
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
                  <button
                    onClick={() => updateField("apiKey")}
                    className="text-green-600 hover:text-green-800"
                    aria-label="Save API key"
                    type="button"
                  >
                    <CheckIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleEditToggle("apiKey")}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Cancel editing API key"
                    type="button"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                {feedback.apiKey && feedback.apiKey !== "Updated successfully." && (
                  <p className="mt-1 text-sm text-red-600">{feedback.apiKey}</p>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-gray-800 text-lg break-all">
                    {user.openai_api_key
                      ? (showApiKey ? user.openai_api_key : "*".repeat(user.openai_api_key.length))
                      : "No Key Provided"}
                  </span>
                  {user.openai_api_key && (
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-1"
                      type="button"
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
                  )}
                </div>
                {feedback.apiKey && feedback.apiKey !== "Updated successfully." && (
                  <p className="mt-1 text-sm text-red-600">{feedback.apiKey}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}