
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    if(!db) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "users"));
        setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err: any) {
         const permissionError = new FirestorePermissionError({ path: 'users', operation: 'list' });
         errorEmitter.emit('permission-error', permissionError);
      } finally {
        setLoading(false);
      }
    })();
  }, [db]);

  const promote = async (uid: string) => {
    if(!db) return;
    const uDoc = doc(db, "users", uid);
    const updateData = { role: "admin" };
    updateDoc(uDoc, updateData).then(() => {
        alert("Set role=admin in users collection. Run make-admin script to grant auth claim.");
        setUsers(users.map(u => u.id === uid ? {...u, ...updateData} : u));
    }).catch(err => {
        const permissionError = new FirestorePermissionError({ path: uDoc.path, operation: 'update', requestResourceData: updateData });
        errorEmitter.emit('permission-error', permissionError);
    })
  };
  
  if (!db) return <div>Loading...</div>

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
