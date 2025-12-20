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
  Save,
  MoreVertical,
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
  subject?: string | string[];
  isPublished?: boolean;
  isPremium?: boolean;
  price?: number;
  updatedAt?: any;
}

export default function TestAdminPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<Test[]>([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "published" | "draft">("all");
  const [priceDraft, setPriceDraft] = useState<Record<string, number>>({});

  async function loadTests() {
    setLoading(true);
    const q = query(
      collection(db, "test_series"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Test[];

    setTests(data);
    setPriceDraft(
      Object.fromEntries(data.map((t) => [t.id, t.price ?? 0]))
    );
    setLoading(false);
  }

  useEffect(() => {
    loadTests();
  }, []);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    tests.forEach((t) => {
      if (Array.isArray(t.subject)) {
        t.subject.forEach((s) => set.add(s));
      } else if (t.subject) {
        set.add(t.subject);
      }
    });
    return Array.from(set);
  }, [tests]);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (
        search &&
        !t.title.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (subjectFilter !== "all") {
        const s = Array.isArray(t.subject)
          ? t.subject
          : [t.subject];
        if (!s.includes(subjectFilter)) return false;
      }
      if (statusFilter === "published" && !t.isPublished) return false;
      if (statusFilter === "draft" && t.isPublished) return false;
      return true;
    });
  }, [tests, search, subjectFilter, statusFilter]);

  async function togglePublish(test: Test) {
    const ok = window.confirm(
      test.isPublished
        ? "Unpublish this test? It will disappear for users."
        : "Publish this test? It will be visible to users."
    );
    if (!ok) return;

    await updateDoc(doc(db, "test_series", test.id), {
      isPublished: !test.isPublished,
      updatedAt: new Date(),
    });
    loadTests();
  }

  async function togglePremium(test: Test) {
    const ok = window.confirm(
      "Changing premium status affects billing and user access globally. Continue?"
    );
    if (!ok) return;

    await updateDoc(doc(db, "test_series", test.id), {
      isPremium: !test.isPremium,
      updatedAt: new Date(),
    });
    loadTests();
  }

  async function savePrice(test: Test) {
    const price = priceDraft[test.id];
    if (price < 0) {
      alert("Price cannot be negative.");
      return;
    }

    const ok = window.confirm(
      `Set price to ₹${price}? ₹0 means Free access.`
    );
    if (!ok) return;

    await updateDoc(doc(db, "test_series", test.id), {
      price,
      updatedAt: new Date(),
    });
    loadTests();
  }

  async function deleteTest(test: Test) {
    const ok = window.confirm(
      `Delete "${test.title}" permanently? This cannot be undone.`
    );
    if (!ok) return;

    await deleteDoc(doc(db, "test_series", test.id));
    loadTests();
  }

  function renderSubjects(subject?: string | string[]) {
    if (!subject) return "-";
    const list = Array.isArray(subject) ? subject : [subject];
    if (list.length <= 2) return list.join(", ");
    return (
      <span title={list.join(", ")}>
        {list.slice(0, 2).join(", ")} +{list.length - 2} more
      </span>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Mock Tests</h1>
        <Link href="/a2gadmin/tests/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        </Link>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search test title"
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
            <option key={s}>{s}</option>
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

      {/* HELPER */}
      <p className="text-sm text-muted-foreground">
        ℹ️ Price ₹0 = Free access. Premium controls affect billing and
        availability everywhere.
      </p>

      {/* TABLE */}
      <div className="border rounded overflow-x-auto">
        {loading ? (
          <div className="p-10 flex justify-center">
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
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((t) => (
                <tr
                  key={t.id}
                  className="border-t hover:bg-muted/40"
                >
                  <td className="p-3 font-medium">{t.title}</td>
                  <td>{renderSubjects(t.subject)}</td>

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

                  <td className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-20"
                      value={priceDraft[t.id]}
                      onChange={(e) =>
                        setPriceDraft({
                          ...priceDraft,
                          [t.id]: Number(e.target.value),
                        })
                      }
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => savePrice(t)}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </td>

                  <td className="p-3 text-right space-x-2">
                    <Link href={`/a2gadmin/tests/edit/${t.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
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
                      onClick={() => deleteTest(t)}
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
