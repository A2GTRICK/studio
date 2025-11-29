
"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AdminMcqs() {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "mcqSets"));
      setSets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete MCQ set?")) return;
    await deleteDoc(doc(db, "mcqSets", id));
    setSets(s => s.filter(su => su.id !== id));
  };

  const togglePremium = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "mcqSets", id), { isPremium: !current });
    setSets(s => s.map(x => x.id === id ? { ...x, isPremium: !current } : x));
  };

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
