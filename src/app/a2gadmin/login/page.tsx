"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/a2gadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = "/a2gadmin";
    } catch (e) {
      setError("Network error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-800 to-black">
      <form
        onSubmit={handleLogin}
        className="backdrop-blur-2xl bg-white/10 p-6 rounded-2xl shadow-2xl border border-white/20 w-96 text-white"
      >
        <h2 className="text-xl font-bold mb-2">Admin Access</h2>
        <p className="text-sm opacity-70 mb-4">Enter the secret key to manage the platform.</p>

        <input
          type="password"
          className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 mb-3"
          placeholder="Secret Key"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-300 mb-3">{error}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-xl transition text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}