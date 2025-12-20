"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
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

/* =====================
   PAGE
===================== */

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  async function toggleBlock(user: User) {
    if (!confirm(`Are you sure you want to ${user.status === "blocked" ? "unblock" : "block"} this user?`)) return;
    await updateDoc(doc(db, "users", user.id), {
      status: user.status === "blocked" ? "active" : "blocked",
    });
    loadUsers();
  }

  async function togglePlan(user: User) {
    if (!confirm(`Change plan for ${user.email}?`)) return;
    await updateDoc(doc(db, "users", user.id), {
      plan: user.plan === "pro" ? "free" : "pro",
    });
    loadUsers();
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const text = `${u.displayName || ""} ${u.email || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Central control panel for plans, access overrides, and account status.
        </p>
      </div>

      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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
                <thead className="border-b text-left">
                  <tr>
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Overrides</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/40">
                      <td className="py-2 font-medium">{user.displayName || "—"}</td>
                      <td>{user.email || "—"}</td>
                      <td>
                        <Badge variant={user.plan === "pro" ? "default" : "outline"}>
                          {user.plan || "free"}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={user.status === "blocked" ? "destructive" : "outline"}>
                          {user.status || "active"}
                        </Badge>
                      </td>
                      <td className="text-xs text-muted-foreground">
                        N:{user.grantedNoteIds?.length || 0} · T:{user.grantedTestIds?.length || 0} · S:{user.grantedServiceSlugs?.length || 0}
                      </td>
                      <td className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/a2gadmin/users/${user.id}`)}>
                          Open
                        </Button>
                        <Button size="sm" onClick={() => togglePlan(user)}>
                          Toggle Plan
                        </Button>
                        <Button
                          size="sm"
                          variant={user.status === "blocked" ? "secondary" : "destructive"}
                          onClick={() => toggleBlock(user)}
                        >
                          {user.status === "blocked" ? "Unblock" : "Block"}
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
