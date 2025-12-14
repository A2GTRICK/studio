
// src/app/a2gadmin/tests/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, PlusCircle } from "lucide-react";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";

interface Test {
    id: string;
    title: string;
    subject?: string;
    isPublished?: boolean;
    updatedAt: any;
    questions?: any[];
}

export default function TestAdminPage() {
  const [loading, setLoading] = useState(true);
  const [allTests, setAllTests] = useState<Test[]>([]);

  async function loadTests() {
      setLoading(true);
      try {
          const testsRef = collection(db, "test_series");
          const q = query(testsRef, orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          const tests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Test));
          setAllTests(tests);
      } catch (error) {
          console.error("Error loading tests:", error);
      }
      setLoading(false);
  }

  useEffect(() => {
    loadTests();
  }, []);

  async function handleDelete(testId: string) {
    if (!confirm("Are you sure you want to delete this test permanently?")) return;
    
    try {
        await deleteDoc(doc(db, "test_series", testId));
        setAllTests(allTests.filter(t => t.id !== testId));
        alert("Test deleted successfully!");
    } catch(err) {
        console.error("Delete failed", err);
        alert("Delete failed!");
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date';
    const dateValue = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    if (isNaN(dateValue.getTime())) return 'Invalid Date';
    return dateValue.toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0 max-w-7xl mx-auto text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mock Test Manager</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and manage all mock tests.</p>
        </div>
        <Link href="/a2gadmin/tests/create" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition">
          <PlusCircle className="w-5 h-5" />
          Create New Test
        </Link>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-secondary/50 border-b">
                <tr>
                    <th className="p-4 font-semibold">Title</th>
                    <th className="p-4 font-semibold hidden md:table-cell">Subject</th>
                    <th className="p-4 font-semibold hidden sm:table-cell">Questions</th>
                    <th className="p-4 font-semibold hidden md:table-cell">Last Updated</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {allTests.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-8 text-muted-foreground">No tests found.</td></tr>
                ) : (
                    allTests.map(test => (
                        <tr key={test.id} className="border-b last:border-b-0">
                            <td className="p-4 font-medium">{test.title}</td>
                            <td className="p-4 hidden md:table-cell text-muted-foreground">{test.subject || '—'}</td>
                            <td className="p-4 hidden sm:table-cell">{test.questions?.length || 0}</td>
                            <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{formatDate(test.updatedAt)}</td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                     <Link href={`/a2gadmin/tests/edit/${test.id}`} className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700">Edit</Link>
                                     <Button size="sm" variant="destructive" onClick={() => handleDelete(test.id)}>Delete</Button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
