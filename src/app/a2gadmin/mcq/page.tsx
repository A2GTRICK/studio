// src/app/a2gadmin/mcq/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Loader2, PlusCircle, ChevronDown } from "lucide-react";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import type { McqSet } from "@/context/mcq-context";

export default function McqAdminPage() {
  const [loading, setLoading] = useState(true);
  const [allMcqSets, setAllMcqSets] = useState<McqSet[]>([]);
  
  const [search, setSearch] = useState("");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  async function loadSets() {
      setLoading(true);
      try {
          const setsRef = collection(db, "mcqSets");
          const q = query(setsRef, orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          const sets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as McqSet));
          
          setAllMcqSets(sets);

          // Auto-expand all subjects by default
          const subjects = Array.from(new Set(sets.map((n: McqSet) => n.subject || "General")));
          const initialExpansion: Record<string, boolean> = {};
          subjects.forEach(sub => { initialExpansion[sub] = true; });
          setExpandedSubjects(initialExpansion);

      } catch (error) {
          console.error("Failed to fetch MCQ sets:", error);
      }
      setLoading(false);
  }

  useEffect(() => {
    loadSets();
  }, []);
  
  const toggleSubjectExpansion = (subject: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
  };

  const groupedAndSortedSets = useMemo(() => {
    let filtered = [...allMcqSets];

    if (search.trim() !== "") {
      filtered = filtered.filter((n) =>
        `${n.title} ${n.subject}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (premiumFilter === "premium") {
      filtered = filtered.filter((n) => n.isPremium === true);
    } else if (premiumFilter === "free") {
      filtered = filtered.filter((n) => !n.isPremium);
    }

    const grouped = filtered.reduce((acc, set) => {
      const subject = set.subject || "General";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(set);
      return acc;
    }, {} as Record<string, McqSet[]>);

    Object.keys(grouped).forEach(subject => {
      grouped[subject].sort((a, b) => {
        const dateA = a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : new Date(a.updatedAt).getTime();
        const dateB = b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : new Date(b.updatedAt).getTime();
        if (sortBy === "latest") return Number(dateB) - Number(dateA);
        if (sortBy === "oldest") return Number(dateA) - Number(dateB);
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
    });

    return grouped;
  }, [allMcqSets, search, premiumFilter, sortBy]);
  
  const orderedSubjects = Object.keys(groupedAndSortedSets).sort();

  async function handleDelete(setId: string) {
    if (!confirm("Are you sure you want to delete this MCQ set permanently?")) return;
    
    try {
        await deleteDoc(doc(db, "mcqSets", setId));
        setAllMcqSets(allMcqSets.filter(s => s.id !== setId));
        alert("MCQ set deleted successfully!");
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
        <Loader2 className="h-10 w-10 animate-spin text-purple-300" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">MCQ Sets Manager</h1>
          <p className="text-sm text-gray-400">Manage your question banks and practice tests.</p>
        </div>
        <Link href="/a2gadmin/mcq/create" className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition">
          <PlusCircle className="w-5 h-5" />
          Create New Set
        </Link>
      </div>

       <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl border">
        <input
          type="text"
          placeholder="Search sets..."
          className="border p-2 rounded-lg w-full sm:w-auto flex-grow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded-lg"
          value={premiumFilter}
          onChange={(e) => setPremiumFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="premium">Premium Only</option>
          <option value="free">Free Only</option>
        </select>
        <select
          className="border p-2 rounded-lg"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="latest">Latest Updated</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      <div className="space-y-6">
        {orderedSubjects.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No MCQ sets found matching your criteria.</p>
        )}
        
        {orderedSubjects.map(subject => (
           <section key={subject} className="bg-white rounded-xl border border-purple-200/80 shadow-sm overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-4 bg-purple-50/50 border-b border-purple-200/80"
                  onClick={() => toggleSubjectExpansion(subject)}
                >
                    <h3 className="text-lg font-bold text-purple-900">{subject}</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{groupedAndSortedSets[subject].length} sets</span>
                        <ChevronDown className={`h-5 w-5 text-purple-700 transition-transform ${expandedSubjects[subject] ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {expandedSubjects[subject] && (
                  <div className="p-4 md:p-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedAndSortedSets[subject].map((set) => (
                      <div
                        key={set.id}
                        className="border rounded-xl shadow-sm hover:shadow-lg transition bg-white p-4 flex flex-col"
                      >
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="font-semibold text-base leading-tight flex-1 pr-2">{set.title}</h2>
                            {set.isPremium && (
                              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">Premium</span>
                            )}
                          </div>
                           <p className="text-sm text-gray-600 line-clamp-2">{set.description || "No description."}</p>
                           <p className="text-xs text-gray-500 mt-2">{set.course} • {set.year}</p>
                           <p className="text-xs font-semibold text-purple-700 mt-2">{set.questions?.length || 0} Questions</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-400 mb-3">
                            Updated: {formatDate(set.updatedAt)}
                          </p>
                          <div className="flex justify-end gap-2">
                             <Link
                                href={`/a2gadmin/mcq/edit/${set.id}`}
                                className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
                              >
                                Edit
                              </Link>
                              <button
                                className="px-3 py-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  handleDelete(set.id);
                                }}
                              >
                                Delete
                              </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </section>
        ))}
      </div>
    </div>
  );
}
