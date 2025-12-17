// src/app/a2gadmin/tests/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, PlusCircle, Eye } from "lucide-react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

interface Test {
  id: string;
  title: string;
  subject?: string;
  isPublished?: boolean;
  updatedAt: any;
  questionCount?: number;
}

export default function TestAdminPage() {
  const [loading, setLoading] = useState(true);
  const [allTests, setAllTests] = useState<Test[]>([]);
  const [confirmTest, setConfirmTest] = useState<Test | null>(null);

  async function loadTests() {
    setLoading(true);
    const testsRef = collection(db, "test_series");
    const q = query(testsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setAllTests(snap.docs.map(d => ({ id: d.id, ...d.data() } as Test)));
    setLoading(false);
  }

  useEffect(() => {
    loadTests();
  }, []);

  async function validateBeforePublish(testId: string): Promise<string | null> {
    const qSnap = await getDocs(
      collection(db, "test_series", testId, "questions")
    );
  
    if (qSnap.empty) {
      return "Cannot publish: Test has no questions.";
    }
  
    let index = 1;
  
    for (const docSnap of qSnap.docs) {
      const q = docSnap.data();
  
      if (!q?.question?.text || !q.question.text.trim()) {
        return `Question ${index}: Missing question text.`;
      }
  
      // FIX: Check if options is an array of objects with a `text` property
      if (
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        q.options.some((opt: any) => typeof opt.text !== 'string' || !opt.text.trim())
      ) {
        return `Question ${index}: At least 2 non-empty options are required.`;
      }
  
      if (
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer >= q.options.length
      ) {
        return `Question ${index}: Invalid correct answer index.`;
      }
  
      index++;
    }
  
    return null; // ✅ All good
  }

  async function togglePublish(test: Test) {
    // Always allow unpublish
    if (test.isPublished) {
      await updateDoc(doc(db, "test_series", test.id), {
        isPublished: false,
      });
      loadTests();
      return;
    }
  
    // Validate BEFORE publishing
    const error = await validateBeforePublish(test.id);
  
    if (error) {
      alert(`Publish blocked:\n\n${error}`);
      return;
    }
  
    await updateDoc(doc(db, "test_series", test.id), {
      isPublished: true,
      updatedAt: new Date(),
    });
  
    loadTests();
  }

  async function handleDelete(test: Test) {
    if (test.isPublished) {
      alert("Unpublish the test before deleting.");
      return;
    }
    if (!confirm("Delete this test permanently?")) return;
    await deleteDoc(doc(db, "test_series", test.id));
    setAllTests(prev => prev.filter(t => t.id !== test.id));
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "—";
    const d = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mock Test Manager</h1>
          <p className="text-muted-foreground">
            Draft, publish, preview, and manage tests
          </p>
        </div>
        <Link
          href="/a2gadmin/tests/create"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg"
        >
          <PlusCircle className="w-5 h-5" />
          Create Test
        </Link>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 hidden md:table-cell">Subject</th>
              <th className="p-4 hidden sm:table-cell">Questions</th>
              <th className="p-4">Status</th>
              <th className="p-4 hidden md:table-cell">Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {allTests.map(test => (
              <tr key={test.id} className="border-t">
                <td className="p-4 font-medium">{test.title}</td>
                <td className="p-4 hidden md:table-cell">
                  {test.subject || "—"}
                </td>
                <td className="p-4 hidden sm:table-cell">
                  {test.questionCount ?? 0}
                </td>
                <td className="p-4">
                  <span
                    className={clsx(
                      "px-2 py-1 rounded text-xs font-semibold",
                      test.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    )}
                  >
                    {test.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                  {formatDate(test.updatedAt)}
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link
                    href={`/dashboard/mock-test/${test.id}?preview=1`}
                    className="inline-flex items-center px-2 py-1 text-sm border rounded"
                  >
                    <Eye className="w-4 h-4 mr-1" /> Preview
                  </Link>
                  <Link
                    href={`/a2gadmin/tests/edit/${test.id}`}
                    className="px-2 py-1 text-sm bg-blue-600 text-white rounded"
                  >
                    Edit
                  </Link>
                  <Button
                    size="sm"
                    variant={test.isPublished ? "secondary" : "default"}
                    onClick={() => {
                      if (test.isPublished) {
                        togglePublish(test); // unpublish = no confirm
                      } else {
                        setConfirmTest(test); // publish = confirm
                      }
                    }}
                  >
                    {test.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(test)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {allTests.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No tests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {confirmTest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">
              Confirm Publish
            </h2>

            <div className="space-y-2 text-sm">
              <p><b>Title:</b> {confirmTest.title}</p>
              <p>
                <b>Questions:</b>{" "}
                <span
                  className={
                    (confirmTest.questionCount ?? 0) < 5
                      ? "text-red-600 font-semibold"
                      : "text-green-600 font-semibold"
                  }
                >
                  {confirmTest.questionCount ?? 0}
                </span>
              </p>

              {(confirmTest.questionCount ?? 0) < 5 && (
                <p className="text-red-600 text-xs">
                  ⚠️ Warning: Very few questions. Are you sure?
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setConfirmTest(null)}
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  await togglePublish(confirmTest);
                  setConfirmTest(null);
                }}
              >
                Confirm Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
