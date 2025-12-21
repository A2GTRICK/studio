
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useFirebase } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signInWithGoogle } from "@/services/googleAuth";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const { auth } = useFirebase();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(redirectTo);
    } catch (err: any) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!auth) return;

    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle(auth);
      router.push(redirectTo);
    } catch {
      setError("Google login failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Login to pharmA2G
        </h1>
        
        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">{error}</p>}

        {/* GOOGLE LOGIN */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4 h-11 text-base"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or login with email
            </span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
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
          
            <div>
                <label className="text-sm font-medium text-gray-700">
                    Password
                </label>
                <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

          <div className="flex justify-end text-sm">
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            href={`/auth/signup?redirect=${redirectTo}`}
            className="text-primary font-medium hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
