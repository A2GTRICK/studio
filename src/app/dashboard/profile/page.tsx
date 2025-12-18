"use client";

import { useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { useAuth } from "@/firebase/provider";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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
import { Loader2, ShieldCheck } from "lucide-react";

/* =========================================================
   PROFILE PAGE — STABLE & PRODUCTION SAFE
========================================================= */

export default function ProfilePage() {
  const authSession = useAuthSession();
  const auth = useAuth();
  const { toast } = useToast();

  const user = authSession?.user;

  const [displayName, setDisplayName] = useState(
    user?.displayName || ""
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  /* ========================
     LOADING / GUARD
  ======================== */

  if (authSession?.loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !auth) {
    return (
      <div className="text-center text-muted-foreground">
        Please log in to view your profile.
      </div>
    );
  }

  /* ========================
     UPDATE DISPLAY NAME
  ======================== */

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    if (displayName.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Invalid name",
        description: "Display name must be at least 2 characters.",
      });
      return;
    }

    if (displayName === user.displayName) {
      toast({
        title: "No changes detected",
        description: "Your name is already up to date.",
      });
      return;
    }

    setLoadingName(true);
    try {
      await updateProfile(user, { displayName });
      toast({
        title: "Profile updated",
        description: "Your display name has been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Unable to update name.",
      });
    } finally {
      setLoadingName(false);
    }
  };

  /* ========================
     UPDATE PASSWORD
  ======================== */

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both current and new password.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak password",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setLoadingPassword(true);

    try {
      // 🔐 Force refresh user session
      await user.reload();

      if (!user.email) {
        throw new Error("Email authentication required.");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      let message = "Password update failed.";

      if (error.code === "auth/wrong-password") {
        message = "Current password is incorrect.";
      } else if (error.code === "auth/too-many-requests") {
        message =
          "Too many attempts. Please wait a few minutes and try again.";
      } else if (error.code === "auth/requires-recent-login") {
        message =
          "For security reasons, please log out and log in again before changing your password.";
      }

      toast({
        variant: "destructive",
        title: "Security verification failed",
        description: message,
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  const initials =
    (user.displayName || user.email || "U")
      .slice(0, 2)
      .toUpperCase();

  /* ========================
     UI
  ======================== */

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-primary">
          <AvatarImage
            src={user.photoURL || undefined}
            alt={user.displayName || ""}
          />
          <AvatarFallback className="text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user.displayName || "Your Profile"}
          </h1>
          <p className="text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      {/* PROFILE INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update how your name appears across the platform.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleUpdateName}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Email (read-only)</Label>
              <Input value={user.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                placeholder="Your name"
              />
            </div>

            <Button type="submit" disabled={loadingName}>
              {loadingName && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* SECURITY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>
            Change your password to keep your account secure.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleUpdatePassword}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="At least 6 characters"
              />
            </div>

            <Button
              type="submit"
              disabled={loadingPassword}
            >
              {loadingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
