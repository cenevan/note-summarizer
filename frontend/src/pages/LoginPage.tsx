import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

        <div className="mb-4">
          <label className="mr-4">
            <input
              type="radio"
              value="email"
              checked={loginMethod === "email"}
              onChange={() => setLoginMethod("email")}
              className="mr-1"
            />
            Email
          </label>
          <label>
            <input
              type="radio"
              value="username"
              checked={loginMethod === "username"}
              onChange={() => setLoginMethod("username")}
              className="mr-1 ml-4"
            />
            Username
          </label>
        </div>

        <label className="block mb-2 font-medium">
          {loginMethod === "email" ? "Email" : "Username"}
        </label>
        <input
          type={loginMethod === "email" ? "email" : "text"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <label className="block mb-2 font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-6"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}