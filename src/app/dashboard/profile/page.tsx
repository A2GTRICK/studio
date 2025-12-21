"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db } from "@/firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ShieldCheck,
  Phone,
  Crown,
  Palette,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase/provider";
import { signOut } from "firebase/auth";

/* =========================================================
   PROFILE PAGE — SAFE ENHANCED VERSION
========================================================= */

type PremiumData = {
  premiumUntil?: string | null;
  isLifetime?: boolean;
  grantedNoteIds?: string[];
  grantedTestIds?: string[];
  grantedServiceSlugs?: string[];
  premiumOverrideIds?: string[];
};

function daysBetween(date?: string | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function premiumMeta(p: PremiumData) {
  if (p.isLifetime) {
    return {
      label: "Lifetime Premium",
      color: "bg-purple-100 text-purple-700",
    };
  }

  const days = daysBetween(p.premiumUntil);

  if (days === null) {
    return {
      label: "Free User",
      color: "bg-gray-100 text-gray-700",
    };
  }

  if (days < 0) {
    return {
      label: "Premium Expired",
      color: "bg-red-100 text-red-700",
    };
  }

  if (days <= 7) {
    return {
      label: `Premium Expiring (${days} days left)`,
      color: "bg-yellow-100 text-yellow-800",
    };
  }

  return {
    label: "Premium Active",
    color: "bg-green-100 text-green-700",
  };
}

export default function ProfilePage() {
  const authSession = useAuthSession();
  const { toast } = useToast();
  const user = authSession?.user;
  const firebaseAuth = useAuth();
  const router = useRouter();

  /* -----------------------
     AUTH FIELDS
  ----------------------- */
  const [displayName, setDisplayName] = useState(
    user?.displayName || ""
  );

  /* -----------------------
     EXTRA PROFILE FIELDS
  ----------------------- */
  const [mobile, setMobile] = useState("");
  const [about, setAbout] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  /* -----------------------
     PREMIUM DATA (READ ONLY)
  ----------------------- */
  const [premium, setPremium] = useState<PremiumData>({});

  /* -----------------------
     PASSWORD
  ----------------------- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    setTheme(currentTheme);
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };


  /* -----------------------
     LOAD PROFILE DATA
  ----------------------- */
  useEffect(() => {
    if (!user) return;

    const loadAll = async () => {
      const profileRef = doc(db, "user_profiles", user.uid);
      const userRef = doc(db, "users", user.uid);

      const [profileSnap, userSnap] = await Promise.all([
        getDoc(profileRef),
        getDoc(userRef),
      ]);

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setMobile(data.mobile || "");
        setAbout(data.about || "");
        setRollNumber(data.rollNumber || "");
      }

      if (userSnap.exists()) {
        setPremium(userSnap.data() as PremiumData);
      }

      setLoading(false);
    };

    loadAll();
  }, [user]);
  
  const handleLogout = async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
    router.push('/');
  };

  if (authSession?.loading || loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-center">Please log in.</p>;
  }

  /* -----------------------
     SAVE PROFILE
  ----------------------- */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      await setDoc(
        doc(db, "user_profiles", user.uid),
        {
          mobile,
          about,
          rollNumber,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: "Profile updated",
        description: "Your information has been saved.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.message,
      });
    } finally {
      setSavingProfile(false);
    }
  };

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

  const initials =
    (user.displayName || user.email || "U")
      .slice(0, 2)
      .toUpperCase();

  const premiumInfo = premiumMeta(premium);

  /* ========================================================= */

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback className="text-xl">
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

          <span
            className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-medium ${premiumInfo.color}`}
          >
            <Crown className="w-4 h-4" />
            {premiumInfo.label}
          </span>
        </div>
      </div>

      {/* BASIC INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            This information is visible across the platform.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user.email || ""} disabled />
            </div>

            <div>
              <Label>Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Mobile Number
              </Label>
              <Input
                placeholder="Optional"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            
            <Button type="submit" disabled={savingProfile}>
              {savingProfile && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
      
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
