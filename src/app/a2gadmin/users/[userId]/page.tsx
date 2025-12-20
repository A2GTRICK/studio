"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  displayName?: string;
  email?: string;
  plan?: "free" | "pro";
  status?: "active" | "blocked";
  createdAt?: any;
  lastLogin?: any;
  grantedNoteIds?: string[];
  grantedTestIds?: string[];
  grantedServiceSlugs?: string[];
};

export default function AdminSingleUserPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadUser();
  }, [userId]);

  async function loadUser() {
    setLoading(true);
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      setUser(null);
    } else {
      setUser({
        id: snap.id,
        ...(snap.data() as any),
      });
    }

    setLoading(false);
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading user...</p>;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-destructive font-medium">User not found.</p>
        <Button variant="outline" onClick={() => router.push("/a2gadmin/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Details</h1>
          <p className="text-muted-foreground">
            Read-only overview of user account and access.
          </p>
        </div>

        <Button variant="outline" onClick={() => router.push("/a2gadmin/users")}>
          ← Back to Users
        </Button>
      </div>

      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">{user.displayName || "—"}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user.email || "—"}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Plan</p>
            <Badge>{user.plan || "free"}</Badge>
          </div>

          <div>
            <p className="text-muted-foreground">Status</p>
            <Badge
              variant={user.status === "blocked" ? "destructive" : "outline"}
            >
              {user.status || "active"}
            </Badge>
          </div>

          <div>
            <p className="text-muted-foreground">Account Created</p>
            <p className="font-medium">
              {user.createdAt?.toDate?.().toLocaleString() || "—"}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Last Login</p>
            <p className="font-medium">
              {user.lastLogin?.toDate?.().toLocaleString() || "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Access Details */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Granted Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {user.grantedNoteIds?.length ? (
              <ul className="list-disc ml-4">
                {user.grantedNoteIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No notes granted.</p>
            )}
          </CardContent>
        </Card>

        {/* Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Granted Tests</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {user.grantedTestIds?.length ? (
              <ul className="list-disc ml-4">
                {user.grantedTestIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No tests granted.</p>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Granted Services</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {user.grantedServiceSlugs?.length ? (
              <ul className="list-disc ml-4">
                {user.grantedServiceSlugs.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No services granted.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground italic">
        Access modification, confirmations, premium expiry, and notifications
        will be added in the next steps.
      </p>
    </div>
  );
}
