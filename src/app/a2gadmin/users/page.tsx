"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  orderBy,
  query,
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

type User = {
  id: string;
  displayName?: string;
  email?: string;
  plan?: string;
  status?: string;
  premiumUntil?: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const snap = await getDocs(
      query(collection(db, "users"), orderBy("createdAt", "desc"))
    );
    setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }

  function premiumInfo(user: User) {
    if (!user.premiumUntil) return { state: "none" };
    const days = Math.ceil(
      (new Date(user.premiumUntil).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    if (days <= 0) return { state: "expired" };
    if (days <= 7) return { state: "soon", days };
    return { state: "active", days };
  }

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        `${u.displayName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <Input
        placeholder="Search users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Users ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Premium</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const p = premiumInfo(u);
                return (
                  <tr
                    key={u.id}
                    className={
                      p.state === "expired"
                        ? "bg-red-50"
                        : p.state === "soon"
                        ? "bg-yellow-50"
                        : ""
                    }
                  >
                    <td>{u.displayName}</td>
                    <td>{u.email}</td>
                    <td>
                      <Badge>{u.plan}</Badge>
                    </td>
                    <td>
                      {p.state === "expired" && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                      {p.state === "soon" && (
                        <Badge className="bg-yellow-500 text-black">
                          Expiring Soon
                        </Badge>
                      )}
                      {p.state === "active" && `${p.days} days`}
                    </td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/a2gadmin/users/${u.id}`)
                        }
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
