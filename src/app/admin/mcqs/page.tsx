
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useFirestore } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminMcqs() {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    if (!db) return;
    (async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "mcqSets"));
      setSets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, [db]);

  const remove = async (id: string) => {
    if (!db) return;
    if (!confirm("Delete MCQ set?")) return;
    const docRef = doc(db, "mcqSets", id);
    deleteDoc(docRef).then(() => {
        setSets(s => s.filter(su => su.id !== id));
    }).catch(err => {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Delete failed:", err);
    });
  };

  const togglePremium = async (id: string, current: boolean) => {
    if (!db) return;
    const docRef = doc(db, "mcqSets", id);
    const updatedData = { isPremium: !current };
    updateDoc(docRef, updatedData).then(() => {
        setSets(s => s.map(x => x.id === id ? { ...x, ...updatedData } : x));
    }).catch(err => {
        const permissionError = new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: updatedData });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Update failed:", err);
    });
  };

  if (!db) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">MCQ Manager</h3>
      {loading ? <div>Loading...</div> : (
        <div className="space-y-3">
          {sets.map(set => (
            <div key={set.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{set.title}</div>
                <div className="text-sm text-gray-500">{set.course} • {set.questionCount || set.questions?.length || 0} Qs</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/mcq-practice/${set.id}`} className="px-3 py-1 border rounded">Preview</Link>
                <button onClick={() => togglePremium(set.id, !!set.isPremium)} className="px-3 py-1 border rounded">{set.isPremium ? "Unmark" : "Mark"}</button>
                <button onClick={() => remove(set.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
