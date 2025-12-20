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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* =======================
   TYPES
======================= */

type User = {
  id: string;
  displayName?: string;
  email?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";
  grantedNoteIds?: string[];
  grantedTestIds?: string[];
  grantedServiceSlugs?: string[];
  premiumUntil?: string; // ISO date
};

type PendingAction =
  | {
      field: "grantedNoteIds" | "grantedTestIds" | "grantedServiceSlugs";
      value: string;
      mode: "grant" | "revoke";
    }
  | {
      field: "premiumUntil";
      value: string;
      mode: "set";
    }
  | null;

/* =======================
   PAGE
======================= */

export default function AdminSingleUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [contentType, setContentType] =
    useState<"note" | "test" | "service">("note");
  const [contentId, setContentId] = useState("");

  const [premiumDays, setPremiumDays] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    if (userId) loadUser();
  }, [userId]);

  async function loadUser() {
    setLoading(true);
    const snap = await getDoc(doc(db, "users", userId));
    setUser(snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null);
    setLoading(false);
  }

  async function confirmAction() {
    if (!user || !pendingAction) return;

    const ref = doc(db, "users", user.id);

    if (pendingAction.field === "premiumUntil") {
      await updateDoc(ref, { premiumUntil: pendingAction.value });
    } else {
      const current: string[] = (user as any)[pendingAction.field] || [];
      const updated =
        pendingAction.mode === "grant"
          ? [...new Set([...current, pendingAction.value])]
          : current.filter((v) => v !== pendingAction.value);

      await updateDoc(ref, { [pendingAction.field]: updated });
    }

    setPendingAction(null);
    setContentId("");
    setPremiumDays("");
    loadUser();
  }

  if (loading) return <p>Loading user…</p>;
  if (!user)
    return (
      <div className="space-y-4">
        <p>User not found</p>
        <Button onClick={() => router.push("/a2gadmin/users")}>Back</Button>
      </div>
    );

  const premiumRemaining =
    user.premiumUntil &&
    Math.max(
      0,
      Math.ceil(
        (new Date(user.premiumUntil).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    );

  function mapField(type: string) {
    if (type === "note") return "grantedNoteIds";
    if (type === "test") return "grantedTestIds";
    return "grantedServiceSlugs";
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Details</h1>
        <Button variant="outline" onClick={() => router.push("/a2gadmin/users")}>
          ← Back
        </Button>
      </div>

      {/* ACCOUNT SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p>{user.displayName || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{user.email || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Plan</p>
            <Badge>{user.plan || "free"}</Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge variant={user.status === "blocked" ? "destructive" : "outline"}>
              {user.status || "active"}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground">Premium Remaining</p>
            <p>{premiumRemaining ? `${premiumRemaining} days` : "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* ADMIN OVERRIDE CONSOLE */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle>Admin Override Console (Advanced)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Manual overrides bypass plans and billing. Use carefully.
          </p>

          {/* UNIVERSAL ACCESS */}
          <div className="grid md:grid-cols-3 gap-3">
            <Select value={contentType} onValueChange={(v: any) => setContentType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="test">Test / MCQ</SelectItem>
                <SelectItem value="service">Service / Feature</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Paste ANY ID / Slug"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
            />

            <Button
              onClick={() =>
                setPendingAction({
                  field: mapField(contentType),
                  value: contentId,
                  mode: "grant",
                })
              }
              disabled={!contentId}
            >
              Apply Override
            </Button>
          </div>

          {/* PREMIUM OVERRIDE */}
          <div className="grid md:grid-cols-3 gap-3">
            <Input
              placeholder="Add premium days (e.g. 30)"
              value={premiumDays}
              onChange={(e) => setPremiumDays(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                const days = Number(premiumDays);
                if (!days) return;
                const base = user.premiumUntil
                  ? new Date(user.premiumUntil)
                  : new Date();
                base.setDate(base.getDate() + days);
                setPendingAction({
                  field: "premiumUntil",
                  value: base.toISOString(),
                  mode: "set",
                });
              }}
            >
              Add Days
            </Button>

            <Button
              variant="destructive"
              onClick={() =>
                setPendingAction({
                  field: "premiumUntil",
                  value: "2099-12-31T00:00:00.000Z",
                  mode: "set",
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
            <DialogTitle>Confirm Admin Override</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            This action will directly modify user access and bypass normal rules.
            Are you sure?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button onClick={confirmAction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
