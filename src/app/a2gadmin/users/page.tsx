"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  doc,
  limit,
  startAfter,
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
  name?: string;
  email?: string;
  phone?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";
  exam?: string;
  createdAt?: any;
};

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [lastDoc, setLastDoc] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers(loadMore = false) {
    setLoading(true);
    
    let q;
    const baseQuery = query(
      collection(db, "user_profiles"),
      orderBy("createdAt", "desc")
    );

    if (loadMore && lastDoc) {
      q = query(baseQuery, startAfter(lastDoc), limit(PAGE_SIZE));
    } else {
      q = query(baseQuery, limit(PAGE_SIZE));
    }

    const snap = await getDocs(q);
    const rows: User[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    setUsers(loadMore ? [...users, ...rows] : rows);
    setLastDoc(snap.docs[snap.docs.length - 1] || null);
    setLoading(false);
  }

  async function toggleBlock(user: User) {
    await updateDoc(doc(db, "user_profiles", user.id), {
      status: user.status === "blocked" ? "active" : "blocked",
    });
    // Optimistically update UI
    setUsers(users.map(u => u.id === user.id ? {...u, status: u.status === 'blocked' ? 'active' : 'blocked'} : u));
  }

  async function changePlan(user: User, plan: "free" | "pro") {
    await updateDoc(doc(db, "user_profiles", user.id), {
      plan,
    });
     // Optimistically update UI
    setUsers(users.map(u => u.id === user.id ? {...u, plan } : u));
  }

  const filteredUsers = users.filter((u) => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower);

    const matchPlan =
      planFilter === "all" || (u.plan || 'free') === planFilter;

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
          {loading && users.length === 0 ? (
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
                    <th className="py-2 px-2">Name</th>
                    <th className="px-2">Email</th>
                    <th className="px-2">Plan</th>
                    <th className="px-2">Status</th>
                    <th className="text-right px-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-0"
                    >
                      <td className="py-3 px-2">
                        {user.name || "—"}
                      </td>
                      <td className="px-2">{user.email || "—"}</td>
                      <td className="px-2">
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
                      <td className="px-2">
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
                      <td className="text-right space-x-2 px-2">
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
           {!loading && lastDoc && (
             <Button
                variant="outline"
                onClick={() => loadUsers(true)}
                className="w-full mt-4"
              >
               Load More
             </Button>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
