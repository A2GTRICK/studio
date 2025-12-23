
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Explicitly define the only allowed admin email for client-side check
const ADMIN_EMAIL = "sharmaarvind28897@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // --- Client-side email pre-check ---
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized Email',
        description: 'This email address is not authorized for admin access.',
      });
      setLoading(false);
      return;
    }

    try {
      // 1. Sign in with Firebase client SDK to get the user and ID token
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. Send the ID token to our secure backend API to create a session
      const res = await fetch("/api/a2gadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // This error comes from our API (e.g., if the UID doesn't match)
        throw new Error(errorData.error || "Admin verification failed on the server.");
      }

      // 3. If the API returns success, redirect to the admin dashboard
      router.push("/a2gadmin");
    } catch (err: any) {
        // This will catch errors from Firebase sign-in (wrong password) or our API
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: err.message || 'Please check your credentials and try again.',
        });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              placeholder="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
