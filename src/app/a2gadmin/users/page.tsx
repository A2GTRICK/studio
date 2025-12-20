"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
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
  premiumUntil?: string | null;
  isLifetime?: boolean;
};

/* ================= HELPERS ================= */

function daysBetween(date?: string | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getPremiumState(user: User) {
  if (user.isLifetime) return "lifetime";

  const days = daysBetween(user.premiumUntil);

  if (days === null) return "free";
  if (days < 0) return "expired";
  return "active";
}

function premiumMeta(user: User) {
  const state = getPremiumState(user);

  if (state === "lifetime")
    return { label: "Lifetime", badge: "bg-purple-100 text-purple-700", row: "bg-purple-50" };

  if (state === "expired")
    return { label: "Expired", badge: "bg-red-100 text-red-700", row: "bg-red-50" };

  if (state === "active") {
    const days = daysBetween(user.premiumUntil);
    if (days !== null && days <= 7) {
      return { label: "Expiring Soon", badge: "bg-yellow-100 text-yellow-800", row: "bg-yellow-50" };
    }
    return { label: "Active", badge: "bg-green-100 text-green-700", row: "" };
  }

  return { label: "Free", badge: "bg-gray-100 text-gray-700", row: "" };
}

/* ================= PAGE ================= */

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "lifetime">("all");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setUsers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  }

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const text = `${u.displayName || ""} ${u.email || ""}`.toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;

      if (filter === "all") return true;
      return getPremiumState(u) === filter;
    });
  }, [users, search, filter]);

  /* ================= EXPORT / COPY ================= */

  function copyEmails() {
    const emails = filteredUsers
      .map(u => u.email)
      .filter(Boolean)
      .join(", ");
    navigator.clipboard.writeText(emails);
    alert("Emails copied to clipboard");
  }

  function exportCSV() {
    const rows = [
      ["Name", "Email", "Plan", "Premium Status"],
      ...filteredUsers.map(u => [
        u.displayName || "",
        u.email || "",
        u.plan || "free",
        premiumMeta(u).label,
      ]),
    ];

    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered-users.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Central control panel for users and premium access.
        </p>
      </div>

      <Input
        placeholder="Search users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="flex gap-2">
        {["all", "active", "expired", "lifetime"].map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f as any)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* EXPORT ACTIONS */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={copyEmails}>
          Copy Emails
        </Button>
        <Button size="sm" variant="outline" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {/* USERS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading users…</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Premium</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const meta = premiumMeta(user);
                    return (
                      <tr key={user.id} className={`border-b ${meta.row}`}>
                        <td>
                          <Checkbox
                            checked={selected.includes(user.id)}
                            onCheckedChange={(v) =>
                              setSelected(prev =>
                                v ? [...prev, user.id] : prev.filter(id => id !== user.id)
                              )
                            }
                          />
                        </td>
                        <td>{user.displayName || "—"}</td>
                        <td>{user.email || "—"}</td>
                        <td><Badge variant="outline">{user.plan || "free"}</Badge></td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="text-right">
                          <Button size="sm" onClick={() => router.push(`/a2gadmin/users/${user.id}`)}>
                            Open
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
