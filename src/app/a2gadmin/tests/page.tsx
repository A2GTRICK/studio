"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type TestItem = { id: string; title?: string };

export default function TestsPage() {
  const [tests, setTests] = useState<TestItem[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/a2gadmin/tests", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTests(data?.items || []);
      }
    })();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tests</h1>
        <Link href="/a2gadmin/tests/create" className="bg-green-600 text-white px-3 py-2 rounded">Create New Test</Link>
      </div>

      <div className="space-y-3">
        {tests.length === 0 && <div className="text-gray-600">No tests yet.</div>}
        {tests.map((t) => (
          <div key={t.id} className="p-3 bg-white border rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-gray-500">ID: {t.id}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/a2gadmin/tests/${t.id}`} className="px-2 py-1 border rounded">Edit</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}