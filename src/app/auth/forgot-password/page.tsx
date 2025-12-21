"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { useFirebase } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { auth } = useFirebase();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.message || "Unable to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-fuchsia-50 to-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-purple-700 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        {!success ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your registered email and we’ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleReset}>
              {/* Email */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={loading}
              >
                {loading ? "Sending reset link..." : "Send reset link"}
              </Button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-14 w-14 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Check your email
            </h2>
            <p className="text-sm text-muted-foreground">
              We’ve sent a password reset link to <br />
              <span className="font-medium text-gray-800">{email}</span>
            </p>

            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/auth/login">Return to login</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}