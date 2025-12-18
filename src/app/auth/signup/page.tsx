"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useFirebase } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const { auth } = useFirebase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    setError(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          Create your account
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-3 px-4 py-2 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 border rounded-lg"
        />

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link
            href={`/auth/login?redirect=${redirectTo}`}
            className="text-purple-700 font-medium"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
