"use client";

import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  id: string;
  displayName?: string;
  email?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";
  grantedNoteIds?: string[];
  grantedTestIds?: string[];
  grantedServiceSlugs?: string[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [noteInput, setNoteInput] = useState("");

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
    await updateDoc(doc(db, "users", user.id), {
      status: user.status === "blocked" ? "active" : "blocked",
    });
    loadUsers();
  }

  async function togglePlan(user: User) {
    await updateDoc(doc(db, "users", user.id), {
      plan: user.plan === "pro" ? "free" : "pro",
    });
    loadUsers();
  }

  async function grantNoteAccess() {
    if (!selectedUser || !noteInput) return;

    const existing = selectedUser.grantedNoteIds || [];
    if (existing.includes(noteInput)) return;

    await updateDoc(doc(db, "users", selectedUser.id), {
      grantedNoteIds: [...existing, noteInput],
    });

    setNoteInput("");
    loadUsers();
  }

  const filteredUsers = users.filter((u) => {
    const text = `${u.displayName || ""} ${u.email || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, plans, and special access.
        </p>
      </div>

      <Input
        placeholder="Search name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td>{user.displayName || "—"}</td>
                      <td>{user.email || "—"}</td>
                      <td>
                        <Badge>
                          {user.plan || "free"}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={user.status === "blocked" ? "destructive" : "outline"}>
                          {user.status || "active"}
                        </Badge>
                      </td>
                      <td className="text-right space-x-2">
                        <Button size="sm" onClick={() => togglePlan(user)}>
                          Toggle Plan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          Grant Access
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

      {/* Grant Access Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Grant Note Access
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Enter Note ID to grant access (example: pharma_unit_3)
          </p>

          <Input
            placeholder="Note ID"
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
          />

          <Button onClick={grantNoteAccess}>
            Grant Access
          </Button>

          {selectedUser?.grantedNoteIds?.length ? (
            <div className="text-sm mt-4">
              <strong>Already Granted:</strong>
              <ul className="list-disc ml-4">
                {selectedUser.grantedNoteIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
