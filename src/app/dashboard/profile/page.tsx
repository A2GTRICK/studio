"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { useAuth } from "@/firebase/provider";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";

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
import { Loader2, ShieldCheck, GraduationCap, Info } from "lucide-react";

/* =========================================================
   PROFILE PAGE — ENHANCED & SAFE
========================================================= */

export default function ProfilePage() {
  const authSession = useAuthSession();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const user = authSession?.user;

  /* ========================
     BASIC PROFILE
  ======================== */
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  /* ========================
     OPTIONAL DETAILS (Firestore)
  ======================== */
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [gradYear, setGradYear] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);

  /* ========================
     PASSWORD
  ======================== */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  /* ========================
     LOAD EXTRA PROFILE
  ======================== */
  useEffect(() => {
    if (!user || !db) return;

    const loadProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setPhone(data.phone || "");
        setCollege(data.college || "");
        setCourse(data.course || "");
        setGradYear(data.gradYear || "");
      }
    };

    loadProfile();
  }, [user, db]);

  /* ========================
     GUARDS
  ======================== */
  if (authSession?.loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !auth || !db) {
    return (
      <div className="text-center text-muted-foreground">
        Please log in to view your profile.
      </div>
    );
  }

  /* ========================
     SAVE PROFILE (SAFE)
  ======================== */
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      // Auth display name
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // Firestore optional profile
      await setDoc(
        doc(db, "users", user.uid),
        {
          phone,
          college,
          course,
          gradYear,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      toast({
        title: "Profile updated",
        description: "Your profile details were saved.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.message || "Unable to save profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  /* ========================
     UPDATE PASSWORD (SAFE)
  ======================== */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Enter current and new password.",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak password",
        description: "Minimum 6 characters required.",
      });
      return;
    }

    setLoadingPassword(true);
    try {
      await user.reload();
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
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
        title: "Security check failed",
        description:
          err.code === "auth/wrong-password"
            ? "Incorrect current password."
            : "Please log in again and retry.",
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
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {user.displayName || "Your Profile"}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* BASIC + OPTIONAL PROFILE */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Optional information to personalize your learning.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <Label>Phone (optional)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <Label>College / Institute</Label>
            <Input value={college} onChange={(e) => setCollege(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Course</Label>
              <Input value={course} onChange={(e) => setCourse(e.target.value)} />
            </div>
            <div>
              <Label>Graduation Year</Label>
              <Input value={gradYear} onChange={(e) => setGradYear(e.target.value)} />
            </div>
          </div>

          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* SECURITY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Security
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="submit" disabled={loadingPassword}>
              {loadingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ACCOUNT META */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" /> Account Info
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>Account created: {new Date(user.metadata.creationTime!).toDateString()}</p>
          <p>Last login: {new Date(user.metadata.lastSignInTime!).toDateString()}</p>
          <p>Auth provider: {user.providerData[0]?.providerId}</p>
        </CardContent>
      </Card>
    </div>
  );
}
