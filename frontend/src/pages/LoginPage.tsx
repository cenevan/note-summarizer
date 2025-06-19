import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  EnvelopeIcon,
  UserIcon,
  LockClosedIcon,
  ArrowRightCircleIcon
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new URLSearchParams();
    form.append("username", identifier); 
    form.append("password", password);

    const response = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.detail || "Login failed. Please try again.");
      return;
    }
    setError(null);

    console.log("Login response:", data);

    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      setIsLoggedIn(true);
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setLoginMethod("email")}
            className={`px-4 py-2 rounded-t-md border-b-2 transition-colors duration-200 flex items-center gap-2 ${
              loginMethod === "email"
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
          >
            <EnvelopeIcon className="w-4 h-4" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("username")}
            className={`px-4 py-2 rounded-t-md border-b-2 transition-colors duration-200 ml-2 flex items-center gap-2 ${
              loginMethod === "username"
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-blue-600"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Username
          </button>
        </div>

        <label className="block mb-2 font-medium flex items-center gap-2">
          {loginMethod === "email" ? <EnvelopeIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
          {loginMethod === "email" ? "Email" : "Username"}
        </label>
        <input
          type={loginMethod === "email" ? "email" : "text"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
          className="w-full p-2 border border-gray-300 rounded mb-6"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition flex items-center justify-center gap-2"
        >
          <ArrowRightCircleIcon className="w-5 h-5" />
          Login
        </button>
      </form>
    </div>
  );
}