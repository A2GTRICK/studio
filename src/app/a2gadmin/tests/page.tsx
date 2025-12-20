"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  PlusCircle,
  Eye,
  Search,
  Trash2,
  Crown,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import clsx from "clsx";

interface Test {
  id: string;
  title: string;
  subject?: string;
  isPublished?: boolean;
  isPremium?: boolean;
  price?: number;
  updatedAt?: any;
  questionCount?: number;
}

export default function TestAdminPage() {
  const [loading, setLoading] = useState(true);
  const [allTests, setAllTests] = useState<Test[]>([]);

  /* FILTER STATES */
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "published" | "draft">("all");

  async function loadTests() {
    setLoading(true);
    const q = query(
      collection(db, "test_series"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    setAllTests(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as Test))
    );
    setLoading(false);
  }

  useEffect(() => {
    loadTests();
  }, []);

  /* SUBJECT OPTIONS */
  const subjects = useMemo(() => {
    const s = new Set<string>();
    allTests.forEach((t) => t.subject && s.add(t.subject));
    return Array.from(s);
  }, [allTests]);

  /* FILTERED DATA */
  const filteredTests = useMemo(() => {
    return allTests.filter((t) => {
      if (
        search &&
        !t.title.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (subjectFilter !== "all" && t.subject !== subjectFilter)
        return false;
      if (statusFilter === "published" && !t.isPublished) return false;
      if (statusFilter === "draft" && t.isPublished) return false;
      return true;
    });
  }, [allTests, search, subjectFilter, statusFilter]);

  /* VALIDATION BEFORE PUBLISH */
  async function validateBeforePublish(testId: string) {
    const snap = await getDocs(
      collection(db, "test_series", testId, "questions")
    );
    if (snap.empty) return "Test has no questions.";
    return null;
  }

  async function togglePublish(test: Test) {
    const confirm = window.confirm(
      test.isPublished
        ? "Unpublish this test? It will disappear for users."
        : "Publish this test? It will be visible to users."
    );
    if (!confirm) return;

    if (!test.isPublished) {
      const err = await validateBeforePublish(test.id);
      if (err) {
        alert(`Publish blocked:\n${err}`);
        return;
      }
    }

    await updateDoc(doc(db, "test_series", test.id), {
      isPublished: !test.isPublished,
      updatedAt: new Date(),
    });

    loadTests();
  }

  async function togglePremium(test: Test) {
    const confirm = window.confirm(
      "Change premium status? This affects billing everywhere."
    );
    if (!confirm) return;

    await updateDoc(doc(db, "test_series", test.id), {
      isPremium: !test.isPremium,
      updatedAt: new Date(),
    });

    loadTests();
  }

  async function updatePrice(test: Test, price: number) {
    if (price < 0) {
      alert("Price cannot be negative.");
      return;
    }

    const confirm = window.confirm(
      `Set price to ₹${price}? This will apply everywhere.`
    );
    if (!confirm) return;

    await updateDoc(doc(db, "test_series", test.id), {
      price,
      updatedAt: new Date(),
    });

    loadTests();
  }

  async function handleDelete(test: Test) {
    const confirm = window.confirm(
      `Delete "${test.title}" permanently? This cannot be undone.`
    );
    if (!confirm) return;

    await deleteDoc(doc(db, "test_series", test.id));
    loadTests();
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mock Tests</h1>
        <Link href="/a2gadmin/tests/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search test title"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded px-3 py-2"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-2"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as any)
          }
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="border rounded overflow-x-auto">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Premium</th>
                <th>Price (₹)</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3 font-medium">{t.title}</td>
                  <td>{t.subject || "-"}</td>

                  <td>
                    <span
                      className={clsx(
                        "px-2 py-1 rounded text-xs",
                        t.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {t.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td>
                    <Button
                      size="sm"
                      variant={t.isPremium ? "default" : "outline"}
                      onClick={() => togglePremium(t)}
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      {t.isPremium ? "Premium" : "Free"}
                    </Button>
                  </td>

                  <td>
                    <Input
                      type="number"
                      defaultValue={t.price || 0}
                      className="w-24"
                      onBlur={(e) =>
                        updatePrice(t, Number(e.target.value))
                      }
                    />
                  </td>

                  <td className="p-3 text-right space-x-2">
                    <Link href={`/a2gadmin/tests/edit/${t.id}`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => togglePublish(t)}
                    >
                      {t.isPublished ? "Unpublish" : "Publish"}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(t)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}

              {!filteredTests.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No tests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
