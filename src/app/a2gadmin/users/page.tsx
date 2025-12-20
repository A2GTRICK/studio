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
import { db, auth } from "@/firebase/config";

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
  name?: string;
  email?: string;
  phone?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";
  exam?: string;
  createdAt?: any;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    // DEBUG LOGS
    console.log("DEBUG: Firebase Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log("DEBUG: auth.currentUser?.uid:", user?.uid);
      console.log("DEBUG: auth.currentUser?.email:", user?.email);
      console.log("DEBUG: Is auth.currentUser null?", user === null);
      if (user) {
        loadUsers();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function loadUsers() {
    setLoading(true);

    try {
        const q = query(
          collection(db, "user_profiles"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const rows: User[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));

        setUsers(rows);
    } catch (error) {
        console.error("DEBUG: Firestore query failed:", error);
    } finally {
        setLoading(false);
    }
  }

  async function toggleBlock(user: User) {
    await updateDoc(doc(db, "user_profiles", user.id), {
      status: user.status === "blocked" ? "active" : "blocked",
    });
    loadUsers();
  }

  async function changePlan(user: User, plan: "free" | "pro") {
    await updateDoc(doc(db, "user_profiles", user.id), {
      plan,
    });
    loadUsers();
  }

  const filteredUsers = users.filter((u) => {
    const nameMatch = u.name?.toLowerCase().includes(search.toLowerCase()) ?? false;
    const emailMatch = u.email?.toLowerCase().includes(search.toLowerCase()) ?? false;
    
    const matchSearch = nameMatch || emailMatch;

    const matchPlan =
      planFilter === "all" || u.plan === planFilter;

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
                        {user.name || "—"}
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>
                        <Badge
                          variant={
                            user.plan === "pro"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.plan || "free"}
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
                              user.plan === "pro"
                                ? "free"
                                : "pro"
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
