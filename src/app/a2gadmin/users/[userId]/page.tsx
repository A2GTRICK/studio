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

/* =====================
   TYPES
===================== */

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
  | { type: "note" | "test" | "service"; value: string; mode: "grant" | "revoke" }
  | null;

/* =====================
   PAGE
===================== */

export default function AdminSingleUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [noteInput, setNoteInput] = useState("");
  const [testInput, setTestInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    if (userId) loadUser();
  }, [userId]);

  async function loadUser() {
    setLoading(true);
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    setUser(snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null);
    setLoading(false);
  }

  async function confirmAction() {
    if (!user || !pendingAction) return;

    const ref = doc(db, "users", user.id);
    const fieldMap = {
      note: "grantedNoteIds",
      test: "grantedTestIds",
      service: "grantedServiceSlugs",
    } as const;

    const field = fieldMap[pendingAction.type];
    const current: string[] = (user as any)[field] || [];

    const updated =
      pendingAction.mode === "grant"
        ? [...new Set([...current, pendingAction.value])]
        : current.filter((v) => v !== pendingAction.value);

    await updateDoc(ref, { [field]: updated });

    setPendingAction(null);
    setNoteInput("");
    setTestInput("");
    setServiceInput("");
    loadUser();
  }

  if (loading) return <p>Loading user…</p>;
  if (!user)
    return (
      <div className="space-y-4">
        <p>User not found.</p>
        <Button onClick={() => router.push("/a2gadmin/users")}>Back</Button>
      </div>
    );

  const premiumRemaining = user.premiumUntil
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.premiumUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Details</h1>
        <Button variant="outline" onClick={() => router.push("/a2gadmin/users")}>
          ← Back
        </Button>
      </div>

      {/* Account Summary */}
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
            <p>{premiumRemaining !== null ? `${premiumRemaining} days` : "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Access Controls */}
      <div className="grid md:grid-cols-3 gap-6">
        <AccessBlock
          title="Notes"
          items={user.grantedNoteIds || []}
          input={noteInput}
          setInput={setNoteInput}
          onGrant={(v) => setPendingAction({ type: "note", value: v, mode: "grant" })}
          onRevoke={(v) => setPendingAction({ type: "note", value: v, mode: "revoke" })}
        />

        <AccessBlock
          title="Tests"
          items={user.grantedTestIds || []}
          input={testInput}
          setInput={setTestInput}
          onGrant={(v) => setPendingAction({ type: "test", value: v, mode: "grant" })}
          onRevoke={(v) => setPendingAction({ type: "test", value: v, mode: "revoke" })}
        />

        <AccessBlock
          title="Services"
          items={user.grantedServiceSlugs || []}
          input={serviceInput}
          setInput={setServiceInput}
          onGrant={(v) => setPendingAction({ type: "service", value: v, mode: "grant" })}
          onRevoke={(v) => setPendingAction({ type: "service", value: v, mode: "revoke" })}
        />
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingAction} onOpenChange={() => setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm">
            Are you sure you want to <strong>{pendingAction?.mode}</strong> access for{" "}
            <strong>{pendingAction?.value}</strong>?
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

/* =====================
   ACCESS BLOCK
===================== */

function AccessBlock({
  title,
  items,
  input,
  setInput,
  onGrant,
  onRevoke,
}: {
  title: string;
  items: string[];
  input: string;
  setInput: (v: string) => void;
  onGrant: (v: string) => void;
  onRevoke: (v: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {items.length ? (
          items.map((id) => (
            <div key={id} className="flex justify-between items-center">
              <span className="truncate">{id}</span>
              <Button size="sm" variant="destructive" onClick={() => onRevoke(id)}>
                Revoke
              </Button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No access granted.</p>
        )}

        <Input
          placeholder={`Enter ${title} ID / Slug`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button size="sm" onClick={() => input && onGrant(input)}>
          Grant Access
        </Button>
      </CardContent>
    </Card>
  );
}
