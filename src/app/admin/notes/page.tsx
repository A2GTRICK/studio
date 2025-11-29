
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "notes"));
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete note?")) return;
    await deleteDoc(doc(db, "notes", id));
    setNotes(s => s.filter(n => n.id !== id));
  };

  const togglePremium = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "notes", id), { isPremium: !current });
    setNotes(s => s.map(n => n.id === id ? { ...n, isPremium: !current } : n));
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Notes Manager</h3>
      <div className="space-y-3">
        {loading ? <div>Loading...</div> : notes.map(n => (
          <div key={n.id} className="p-3 border rounded flex justify-between items-start gap-3">
            <div>
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-gray-500">{n.course} • {n.year}</div>
              <div className="text-sm mt-2">{(n.short || n.description || "").slice(0, 160)}</div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={() => togglePremium(n.id, !!n.isPremium)} className="px-3 py-1 border rounded w-40">
                {n.isPremium ? "Unmark Premium" : "Mark Premium"}
              </button>
              <button onClick={() => remove(n.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
