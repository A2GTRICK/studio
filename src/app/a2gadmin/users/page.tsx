"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

/* ================= TYPES ================= */

type User = {
  id: string;
  displayName?: string;
  email?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";

  premiumUntil?: string | null;
  isLifetime?: boolean;
};

/* ================= HELPERS ================= */

function daysBetween(date?: string | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function premiumState(user: User) {
  if (user.isLifetime) return "lifetime";
  const days = daysBetween(user.premiumUntil);
  if (days === null) return "free";
  if (days < 0) return "expired";
  return "active";
}

function premiumBadge(user: User) {
  if (user.isLifetime) return <Badge>Lifetime</Badge>;
  const days = daysBetween(user.premiumUntil);
  if (days === null) return <Badge variant="outline">Free</Badge>;
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days <= 7) return <Badge variant="secondary">Expiring Soon</Badge>;
  return <Badge>Active</Badge>;
}

/* ================= PAGE ================= */

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "active" | "expired" | "lifetime"
  >("all");

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setUsers(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }))
    );
    setLoading(false);
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const text = `${u.displayName || ""} ${u.email || ""}`.toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;

      if (filter === "all") return true;
      return premiumState(u) === filter;
    });
  }, [users, search, filter]);

  async function bulkUpdate(data: Partial<User>) {
    for (const id of selected) {
      await updateDoc(doc(db, "users", id), data);
    }
    setSelected([]);
    loadUsers();
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Central control panel for users and premium access.
        </p>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          size="sm"
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          size="sm"
          variant={filter === "expired" ? "default" : "outline"}
          onClick={() => setFilter("expired")}
        >
          Expired
        </Button>
        <Button
          size="sm"
          variant={filter === "lifetime" ? "default" : "outline"}
          onClick={() => setFilter("lifetime")}
        >
          Lifetime
        </Button>
      </div>

      {/* BULK ACTIONS */}
      {selected.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap gap-2 py-4">
            <span className="text-sm text-muted-foreground">
              {selected.length} selected
            </span>
            <Button size="sm" onClick={() => bulkUpdate({ status: "blocked" })}>
              Block
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkUpdate({ status: "active" })}
            >
              Unblock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkUpdate({ plan: "free" })}
            >
              Set Free
            </Button>
            <Button
              size="sm"
              onClick={() => bulkUpdate({ plan: "pro" })}
            >
              Set Pro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* USERS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading users…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th>
                      <Checkbox
                        checked={
                          selected.length === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        onCheckedChange={(v) =>
                          setSelected(v ? filteredUsers.map((u) => u.id) : [])
                        }
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Premium</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td>
                        <Checkbox
                          checked={selected.includes(user.id)}
                          onCheckedChange={(v) =>
                            setSelected((prev) =>
                              v
                                ? [...prev, user.id]
                                : prev.filter((id) => id !== user.id)
                            )
                          }
                        />
                      </td>
                      <td>{user.displayName || "—"}</td>
                      <td>{user.email || "—"}</td>
                      <td>
                        <Badge variant="outline">
                          {user.plan || "free"}
                        </Badge>
                      </td>
                      <td>{premiumBadge(user)}</td>
                      <td className="text-right">
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/a2gadmin/users/${user.id}`)
                          }
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
