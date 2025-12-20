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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  displayName?: string;
  email?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";
  isPremium?: boolean;
  createdAt?: any;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    const rows: User[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    setUsers(rows);
    setLoading(false);
  }

  async function toggleBlock(user: User) {
    await updateDoc(doc(db, "users", user.id), {
      status: user.status === "blocked" ? "active" : "blocked",
    });
    loadUsers();
  }

  async function changePlan(user: User, plan: "free" | "pro") {
    await updateDoc(doc(db, "users", user.id), {
      plan,
      isPremium: plan === "pro",
    });
    loadUsers();
  }

  const filteredUsers = users.filter((u) => {
    const text =
      `${u.displayName || ""} ${u.email || ""}`.toLowerCase();

    const matchSearch = text.includes(search.toLowerCase());
    const matchPlan =
      planFilter === "all" ||
      (planFilter === "pro" && u.isPremium) ||
      (planFilter === "free" && !u.isPremium);

    return matchSearch && matchPlan;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage platform users, plans, and access.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <CardTitle>Users ({filteredUsers.length})</CardTitle>

          <div className="flex gap-3 w-full md:w-auto">
            <Input
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select
              value={planFilter}
              onValueChange={setPlanFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted-foreground">
              No users found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0"
                    >
                      <td className="py-3">
                        {user.displayName || "—"}
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>
                        <Badge
                          variant={
                            user.isPremium
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.isPremium ? "pro" : "free"}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          variant={
                            user.status === "blocked"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {user.status || "active"}
                        </Badge>
                      </td>
                      <td className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            changePlan(
                              user,
                              user.isPremium ? "free" : "pro"
                            )
                          }
                        >
                          Toggle Plan
                        </Button>

                        <Button
                          size="sm"
                          variant={
                            user.status === "blocked"
                              ? "secondary"
                              : "destructive"
                          }
                          onClick={() => toggleBlock(user)}
                        >
                          {user.status === "blocked"
                            ? "Unblock"
                            : "Block"}
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