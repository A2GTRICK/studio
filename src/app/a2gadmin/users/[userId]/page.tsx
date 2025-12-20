"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  premiumContentOverrides?: string[];

  premiumUntil?: string; // ISO date
};

/* ======================
   PAGE
====================== */

export default function AdminSingleUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [noteInput, setNoteInput] = useState("");
  const [testInput, setTestInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [premiumOverrideInput, setPremiumOverrideInput] = useState("");

  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function loadUser() {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      const data = snap.data() as any;
      setUser({ id: snap.id, ...data });
      if (data.premiumUntil) {
        setExpiryDate(data.premiumUntil.slice(0, 10)); // YYYY-MM-DD
      }
    }
    setLoading(false);
  }

  function remainingDays() {
    if (!user?.premiumUntil) return null;
    const days = Math.ceil(
      (new Date(user.premiumUntil).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  }

  async function updateArray(
    field: keyof User,
    value: string,
    mode: "add" | "remove"
  ) {
    const current = ((user as any)[field] as string[]) || [];
    const updated =
      mode === "add"
        ? [...new Set([...current, value])]
        : current.filter((v) => v !== value);

    await updateDoc(doc(db, "users", user!.id), {
      [field]: updated,
    });

    loadUser();
  }

  async function addPremiumDays(days: number) {
    const base = user?.premiumUntil
      ? new Date(user.premiumUntil)
      : new Date();
    base.setDate(base.getDate() + days);

    await updateDoc(doc(db, "users", user!.id), {
      premiumUntil: base.toISOString(),
      plan: "pro",
    });

    loadUser();
  }

  async function setExpiryFromCalendar() {
    if (!expiryDate) return;
    const iso = new Date(expiryDate).toISOString();

    await updateDoc(doc(db, "users", user!.id), {
      premiumUntil: iso,
      plan: "pro",
    });

    loadUser();
  }

  if (loading) return <p>Loading user…</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ADMIN · USER CONTROL</h1>
        <Button variant="outline" onClick={() => router.push("/a2gadmin/users")}>
          ← Back
        </Button>
      </div>

      {/* SUMMARY */}
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
            <p>
              {remainingDays() !== null
                ? `${remainingDays()} days`
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ACCESS BOXES */}
      <div className="grid md:grid-cols-3 gap-6">
        <AccessBox
          title="Notes Access"
          items={user.grantedNoteIds || []}
          input={noteInput}
          setInput={setNoteInput}
          onAdd={(v) => updateArray("grantedNoteIds", v, "add")}
          onRemove={(v) => updateArray("grantedNoteIds", v, "remove")}
        />

        <AccessBox
          title="Tests / MCQs Access"
          items={user.grantedTestIds || []}
          input={testInput}
          setInput={setTestInput}
          onAdd={(v) => updateArray("grantedTestIds", v, "add")}
          onRemove={(v) => updateArray("grantedTestIds", v, "remove")}
        />

        <AccessBox
          title="Services Access"
          items={user.grantedServiceSlugs || []}
          input={serviceInput}
          setInput={setServiceInput}
          onAdd={(v) => updateArray("grantedServiceSlugs", v, "add")}
          onRemove={(v) => updateArray("grantedServiceSlugs", v, "remove")}
        />
      </div>

      {/* PREMIUM CONTENT OVERRIDE */}
      <Card className="border-2 border-purple-500">
        <CardHeader>
          <CardTitle>🔥 Premium Content Overrides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {(user.premiumContentOverrides || []).map((id) => (
            <div key={id} className="flex justify-between items-center">
              <span>{id}</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  updateArray("premiumContentOverrides", id, "remove")
                }
              >
                Revoke
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <Input
              placeholder="Paste ANY premium content ID"
              value={premiumOverrideInput}
              onChange={(e) => setPremiumOverrideInput(e.target.value)}
            />
            <Button
              onClick={() =>
                premiumOverrideInput &&
                updateArray(
                  "premiumContentOverrides",
                  premiumOverrideInput,
                  "add"
                )
              }
            >
              Grant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PREMIUM TIME CONTROL */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Time Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => addPremiumDays(30)}>+30 Days</Button>
            <Button onClick={() => addPremiumDays(90)}>+90 Days</Button>
            <Button
              variant="destructive"
              onClick={() => addPremiumDays(365 * 50)}
            >
              Lifetime Premium
            </Button>
          </div>

          {/* CALENDAR */}
          <div className="flex gap-3 items-center">
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            <Button onClick={setExpiryFromCalendar}>
              Set Expiry Date
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ======================
   REUSABLE BOX
====================== */

function AccessBox({
  title,
  items,
  input,
  setInput,
  onAdd,
  onRemove,
}: {
  title: string;
  items: string[];
  input: string;
  setInput: (v: string) => void;
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {items.length ? (
          items.map((id) => (
            <div key={id} className="flex justify-between items-center">
              <span>{id}</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemove(id)}
              >
                Revoke
              </Button>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No access granted.</p>
        )}

        <Input
          placeholder="Enter ID / Slug"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button size="sm" onClick={() => input && onAdd(input)}>
          Grant
        </Button>
      </CardContent>
    </Card>
  );
}
