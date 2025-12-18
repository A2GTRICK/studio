"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase/provider";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;

    try {
      setLoading(true);
      setError("");

      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect") || "/dashboard";

      await createUserWithEmailAndPassword(auth, email, password);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Create your account
        </h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-purple-700 font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
