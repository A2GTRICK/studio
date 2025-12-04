"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    try {
      const res = await fetch("/api/a2gadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.message || "Login failed");
        return;
      }
      window.location.href = "/a2gadmin";
    } catch (err) {
      setError("Network error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-bold mb-2">Admin Access</h2>
        <p className="text-sm text-gray-600 mb-4">Enter the secret key to manage the platform.</p>
        <input
          type="password"
          className="w-full border px-3 py-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Secret Key"
        />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button className="w-full bg-purple-600 text-white py-2 rounded" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}