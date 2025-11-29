"use client";

import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>

      <div className="space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
        <p><strong>Role:</strong> {user.role || "Student"}</p>
        <p><strong>Premium:</strong> {user.isPremium ? "Yes ⭐" : "No"}</p>
      </div>
    </div>
  );
}