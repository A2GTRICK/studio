"use client";

import { useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
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
import { Loader2, ShieldCheck, GraduationCap } from "lucide-react";

/* =========================================================
   PROFILE PAGE — FINAL, STABLE, EDUCATOR-GRADE
========================================================= */

export default function ProfilePage() {
  const authSession = useAuthSession();
  const { toast } = useToast();
  const user = authSession?.user;

  /* -----------------------
     BASIC INFO STATE
  ----------------------- */
  const [displayName, setDisplayName] = useState(
    user?.displayName || ""
  );

  /* -----------------------
     OPTIONAL ACADEMIC INFO
  ----------------------- */
  const [targetExam, setTargetExam] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [studyYear, setStudyYear] = useState("");

  /* -----------------------
     PASSWORD STATE
  ----------------------- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingName, setLoadingName] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  /* -----------------------
     LOADING / GUARD
  ----------------------- */
  if (authSession?.loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-muted-foreground">
        Please log in to view your profile.
      </div>
    );
  }

  /* -----------------------
     UPDATE DISPLAY NAME
  ----------------------- */
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
        title: "No changes",
        description: "Your name is already up to date.",
      });
      return;
    }

    setLoadingName(true);
    try {
      await updateProfile(user, { displayName });
      toast({
        title: "Profile updated",
        description: "Your name has been saved successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.message || "Unable to update profile.",
      });
    } finally {
      setLoadingName(false);
    }
  };

  /* -----------------------
     UPDATE PASSWORD
  ----------------------- */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter both passwords.",
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
      } else if (error.code === "auth/requires-recent-login") {
        message =
          "Please log out and log in again before changing password.";
      }

      toast({
        variant: "destructive",
        title: "Security check failed",
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

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-primary">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-3xl font-bold">
            {user.displayName || "Your Profile"}
          </h1>
          <p className="text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      {/* BASIC INFORMATION */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            This information is used across the platform.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
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

      {/* ACADEMIC PREFERENCES (OPTIONAL) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Academic Preferences
          </CardTitle>
          <CardDescription>
            Optional — helps personalize your learning.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Target Exam / Course</Label>
            <Input
              placeholder="GPAT / D.Pharm / B.Pharm"
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>College / University</Label>
            <Input
              placeholder="Optional"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Year of Study / Graduation</Label>
            <Input
              placeholder="e.g. Final Year / 2026"
              value={studyYear}
              onChange={(e) => setStudyYear(e.target.value)}
            />
          </div>
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
            Change your account password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
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
              />
            </div>

            <Button type="submit" disabled={loadingPassword}>
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
