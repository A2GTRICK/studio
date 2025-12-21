"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ShieldCheck,
  Palette,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/provider";

export default function SettingsPage() {
  const authSession = useAuthSession();
  const { toast } = useToast();
  const user = authSession?.user;
  const firebaseAuth = useAuth();
  const router = useRouter();

  /* -----------------------
     PASSWORD
  ----------------------- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* -----------------------
     STATE
  ----------------------- */
  const [savingPassword, setSavingPassword] = useState(false);
  const [theme, setTheme] = useState("light");

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
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
    router.push("/");
  };

  if (authSession?.loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Log In Required</CardTitle>
            <CardDescription>Please log in to manage your account settings.</CardDescription>
          </CardHeader>
           <CardContent>
              <Button onClick={() => router.push('/auth/login?redirect=/dashboard/settings')}>Log In</Button>
           </CardContent>
        </Card>
      </div>
    );
  }

  /* -----------------------
     PASSWORD CHANGE
  ----------------------- */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Fill both password fields.",
      });
      return;
    }

    setSavingPassword(true);

    try {
      if (!user.email) throw new Error("Email required");

      const cred = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);

      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });

      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: err.message,
      });
    } finally {
      setSavingPassword(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-8">
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

      {/* SECURITY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ShieldCheck className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter a new password"
              />
            </div>

            <Button
              type="submit"
              disabled={savingPassword}
            >
              {savingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="pt-4">
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>

    </div>
  );
}
