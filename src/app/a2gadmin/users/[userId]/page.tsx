"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* ======================
   TYPES
====================== */

type User = {
  id: string;
  displayName?: string;
  email?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";
  grantedNoteIds?: string[];
  grantedTestIds?: string[];
  grantedServiceSlugs?: string[];
  premiumUntil?: string;
};

type PendingAction = {
  label: string;
  execute: () => Promise<void>;
} | null;

/* ======================
   PAGE
====================== */

export default function AdminSingleUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [overrideType, setOverrideType] =
    useState<"note" | "test" | "service" | "bundle" | "feature">("note");
  const [overrideValue, setOverrideValue] = useState("");

  const [premiumDays, setPremiumDays] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function loadUser() {
    const snap = await getDoc(doc(db, "users", userId));
    setUser(snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null);
    setLoading(false);
  }

  if (loading) return <p>Loading user…</p>;
  if (!user) return <p>User not found</p>;

  const premiumRemaining =
    user.premiumUntil &&
    Math.ceil(
      (new Date(user.premiumUntil).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );

  function fieldForType(type: string) {
    if (type === "note") return "grantedNoteIds";
    if (type === "test") return "grantedTestIds";
    return "grantedServiceSlugs";
  }

  async function applyOverride() {
    const field = fieldForType(overrideType);
    const current: string[] = (user as any)[field] || [];
    await updateDoc(doc(db, "users", user.id), {
      [field]: [...new Set([...current, overrideValue])],
    });
    setOverrideValue("");
    loadUser();
  }

  async function addPremiumDays() {
    const days = Number(premiumDays);
    const base = user.premiumUntil
      ? new Date(user.premiumUntil)
      : new Date();
    base.setDate(base.getDate() + days);

    await updateDoc(doc(db, "users", user.id), {
      premiumUntil: base.toISOString(),
      plan: "pro",
    });
    setPremiumDays("");
    loadUser();
  }

  async function lifetimePremium() {
    await updateDoc(doc(db, "users", user.id), {
      premiumUntil: "2099-12-31T00:00:00.000Z",
      plan: "pro",
    });
    loadUser();
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ADMIN · USER CONTROL</h1>
        <Button variant="outline" onClick={() => router.push("/a2gadmin/users")}>
          ← Back
        </Button>
      </div>

      {/* USER SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p>{user.displayName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Plan</p>
            <Badge>{user.plan}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge>{user.status}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Premium Remaining</p>
            <p>{premiumRemaining ? `${premiumRemaining} days` : "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* 🔴 ADMIN OVERRIDE PANEL */}
      <Card className="border-2 border-red-400">
        <CardHeader>
          <CardTitle>🔴 ADMIN OVERRIDE CONSOLE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This section bypasses ALL plans, billing, and UI restrictions.
          </p>

          <div className="grid md:grid-cols-3 gap-3">
            <Select value={overrideType} onValueChange={(v: any) => setOverrideType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="test">Test / MCQ</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
                <SelectItem value="feature">Feature Flag</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Paste ANY ID or slug"
              value={overrideValue}
              onChange={(e) => setOverrideValue(e.target.value)}
            />

            <Button
              variant="destructive"
              disabled={!overrideValue}
              onClick={() =>
                setPendingAction({
                  label: "Apply admin override",
                  execute: applyOverride,
                })
              }
            >
              APPLY OVERRIDE
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Input
              placeholder="Add premium days"
              value={premiumDays}
              onChange={(e) => setPremiumDays(e.target.value)}
            />
            <Button onClick={() =>
              setPendingAction({
                label: "Add premium days",
                execute: addPremiumDays,
              })
            }>
              Add Premium Days
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                setPendingAction({
                  label: "Grant lifetime premium",
                  execute: lifetimePremium,
                })
              }
            >
              Lifetime Premium
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CONFIRMATION */}
      <Dialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Admin Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            You are about to perform a powerful admin override.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await pendingAction?.execute();
                setPendingAction(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
