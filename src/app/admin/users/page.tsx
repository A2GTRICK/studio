
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { getAuth } from "firebase/auth";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const promote = async (uid: string) => {
    // This only updates 'users' doc; to grant admin claim, run server script
    const uDoc = doc(db, "users", uid);
    await updateDoc(uDoc, { role: "admin" });
    alert("Set role=admin in users collection. Run make-admin script to grant auth claim.");
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">User accounts</h3>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {users.map(u => (
            <div className="p-3 border rounded flex justify-between items-center" key={u.id}>
              <div>
                <div className="font-semibold">{u.displayName || u.email}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
                 <div className="text-xs text-gray-400">{u.id}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => promote(u.id)} className="px-3 py-1 border rounded" disabled={u.role === 'admin'}>
                    {u.role === 'admin' ? 'Admin' : 'Promote'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
