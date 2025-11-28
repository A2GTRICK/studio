"use client";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/lib/auth";

export default function ProfilePage() {
  const { user, role } = useUserProfile();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
    }
  }, [user]);

  async function saveProfile() {
    if (!user) return setMessage("Sign in first");
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, displayName: name })
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) {
      setMessage("Profile updated successfully");
      // refresh: simple trick — reload after small delay so header picks new name
      setTimeout(()=>location.reload(), 800);
    } else {
      setMessage("Update failed: " + (data.error || "unknown"));
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">My Profile</h1>
      {!user ? (
        <p className="text-gray-600">Please sign in to view and edit your profile.</p>
      ) : (
        <>
          <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded mt-1"
                placeholder="Your full name"
              />
            </div>

            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Role</p>
              <p className="font-semibold">{role || "student"}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              {message && <p className="text-sm text-gray-600">{message}</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
