"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function TestsAdminPage() {
  const [tests, setTests] = useState([]);

  async function loadTests() {
    const res = await fetch("/api/a2gadmin/tests");
    const data = await res.json();
    setTests(data.tests || []);
  }

  useEffect(() => {
    loadTests();
  }, []);

  async function deleteTest(id: string) {
    if (!confirm("Delete this test?")) return;
    await fetch(`/api/a2gadmin/tests?id=${id}`, { method: "DELETE" });
    loadTests();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tests Manager</h1>
        <Link
          href="/a2gadmin/tests/create"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          + Create Test
        </Link>
      </div>

      {tests.length === 0 && (
        <p className="text-gray-600">No tests created yet.</p>
      )}

      <div className="space-y-4">
        {tests.map((t: any) => (
          <div
            key={t.id}
            className="p-4 border rounded-xl bg-white shadow-sm flex justify-between"
          >
            <div>
              <h2 className="font-bold text-lg">{t.title}</h2>
              <p className="text-sm text-gray-600">
                {t.course} • {t.subject} • {t.year}
              </p>
              <p className="text-xs text-gray-500">
                {t.questions?.length || 0} questions
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/a2gadmin/tests/edit/${t.id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg"
              >
                Edit
              </Link>

              <button
                onClick={() => deleteTest(t.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
