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

/* ================= TYPES ================= */

type User = {
  id: string;
  displayName?: string;
  email?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";

  premiumUntil?: string | null;
  isLifetime?: boolean;

  grantedNoteIds?: string[];
  grantedTestIds?: string[];
  grantedServiceSlugs?: string[];
  premiumOverrideIds?: string[];
};

/* ================= HELPERS ================= */

function daysBetween(date?: string | null) {
  if (!date) return null;
  const diff =
    new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function premiumBadge(user: User) {
  if (user.isLifetime) return <Badge>Lifetime</Badge>;
  const days = daysBetween(user.premiumUntil);
  if (days === null) return <Badge variant="outline">Free</Badge>;
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days <= 7) return <Badge variant="secondary">Expiring</Badge>;
  return <Badge>Active</Badge>;
}

/* ================= PAGE ================= */

export default function AdminSingleUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [confirm, setConfirm] = useState<{
    action: () => Promise<void>;
    text: string;
  } | null>(null);

  const [input, setInput] = useState("");

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function loadUser() {
    setLoading(true);
    const snap = await getDoc(doc(db, "users", userId));
    setUser(
      snap.exists()
        ? { id: snap.id, ...(snap.data() as any) }
        : null
    );
    setLoading(false);
  }

  async function update(data: Partial<User>) {
    if (!user) return;
    await updateDoc(doc(db, "users", user.id), data);
    loadUser();
  }

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  const remainingDays = daysBetween(user.premiumUntil);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Admin · User Control</h1>
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      {/* ACCOUNT SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
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
            <p className="text-muted-foreground">Premium Status</p>
            {premiumBadge(user)}
          </div>
          {remainingDays !== null && !user.isLifetime && (
            <div>
              <p className="text-muted-foreground">Premium Remaining</p>
              <p>{remainingDays} days</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PREMIUM TIME CONTROL */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Time Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            type="date"
            value={
              user.premiumUntil
                ? user.premiumUntil.slice(0, 10)
                : ""
            }
            onChange={(e) =>
              update({
                premiumUntil: new Date(e.target.value).toISOString(),
                isLifetime: false,
              })
            }
          />

          <div className="flex gap-2">
            <Button
              onClick={() =>
                setConfirm({
                  text: "+30 Days Premium",
                  action: async () =>
                    update({
                      premiumUntil: new Date(
                        Date.now() + 30 * 86400000
                      ).toISOString(),
                      isLifetime: false,
                    }),
                })
              }
            >
              +30 Days
            </Button>

            <Button
              onClick={() =>
                setConfirm({
                  text: "+90 Days Premium",
                  action: async () =>
                    update({
                      premiumUntil: new Date(
                        Date.now() + 90 * 86400000
                      ).toISOString(),
                      isLifetime: false,
                    }),
                })
              }
            >
              +90 Days
            </Button>

            <Button
              variant="secondary"
              onClick={() =>
                setConfirm({
                  text: "Set Lifetime Premium",
                  action: async () =>
                    update({
                      isLifetime: true,
                      premiumUntil: null,
                    }),
                })
              }
            >
              Lifetime
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PREMIUM OVERRIDES */}
      <AccessBlock
        title="🔥 Premium Overrides (ANYTHING)"
        items={user.premiumOverrideIds || []}
        onAdd={(v) =>
          update({
            premiumOverrideIds: [
              ...(user.premiumOverrideIds || []),
              v,
            ],
          })
        }
        onRemove={(v) =>
          update({
            premiumOverrideIds: (user.premiumOverrideIds || []).filter(
              (x) => x !== v
            ),
          })
        }
        input={input}
        setInput={setInput}
      />

      {/* CONFIRM DIALOG */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <p>{confirm?.text}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await confirm?.action();
                setConfirm(null);
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

/* ================= REUSABLE BLOCK ================= */

function AccessBlock({
  title,
  items,
  onAdd,
  onRemove,
  input,
  setInput,
}: {
  title: string;
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  input: string;
  setInput: (v: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length ? (
          items.map((id) => (
            <div key={id} className="flex justify-between">
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
          <p className="text-muted-foreground">No overrides granted.</p>
        )}

        <Input
          placeholder="Paste ANY content ID / slug"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          size="sm"
          onClick={() => {
            if (input.trim()) {
              onAdd(input.trim());
              setInput("");
            }
          }}
        >
          Grant
        </Button>
      </CardContent>
    </Card>
  );
}
