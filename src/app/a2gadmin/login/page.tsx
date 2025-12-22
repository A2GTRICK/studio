
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Explicitly define the only allowed admin email
const ADMIN_EMAIL = "sharmaarvind28897@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");

    // --- Client-side email check ---
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError("This email address is not authorized for admin access.");
      toast({
        variant: 'destructive',
        title: 'Unauthorized Email',
        description: 'Please use the registered admin email address.',
      });
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Send ID token to the backend to create a session
      const res = await fetch("/api/a2gadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Admin verification failed");
      }

      router.push("/a2gadmin");
    } catch (err: any) {
        if (err.message.includes("Unauthorized")) {
             setError("This account does not have admin privileges.");
             toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'This account does not have admin privileges.',
            });
        } else {
            setError("Invalid credentials or server error.");
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Please check your email and password.',
            });
        }
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
        <CardContent className="space-y-4">
          <Input
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
