"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/firebase/provider";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { Palette, LogOut } from "lucide-react";
import EmailVerificationBanner from "@/components/email-verification-banner";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);
    document.documentElement.classList.toggle("dark", currentTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <EmailVerificationBanner />
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {/* APPEARANCE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" /> Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Theme</Label>
            <Button variant="outline" onClick={toggleTheme}>
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ACCOUNT ACTIONS */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <LogOut className="w-5 h-5" /> Account Actions
            </CardTitle>
            <CardDescription>
                Log out from your current session.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Button variant="destructive" onClick={handleLogout}>
                Log Out
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
