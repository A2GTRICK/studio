
'use client';
import React, { useMemo, useState } from "react";
import McqSetCard from "@/components/McqSetCard";
import type { McqSet } from "@/types/mcq-set";
import MCQPlayer from "@/components/mcq/MCQPlayer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function McqPracticeClient({ initialSets }: { initialSets: McqSet[] }) {
  const [mcqSets] = useState<McqSet[]>(initialSets);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("latest");
  
  const [activeSet, setActiveSet] = useState<McqSet | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    mcqSets.forEach((s) => {
        if(s.course) set.add(s.course)
    });
    return ["All", ...Array.from(set)];
  }, [mcqSets]);

  const filtered = useMemo(() => {
    let list = mcqSets.filter(s => s.isPublished !== false); // Default to showing published sets

    if (activeCategory && activeCategory !== "All") {
      list = list.filter((s) => (s.course || "General") === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (s.subject || "").toLowerCase().includes(q)
      );
    }

    list.sort((a,b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        if (sortBy === 'latest') return dateB - dateA;
        if (sortBy === 'oldest') return dateA - dateB;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
    });

    return list;
  }, [mcqSets, activeCategory, query, sortBy]);

  const openPlayer = (set: McqSet) => {
    setActiveSet(set);
  };
  
  const closePlayer = () => {
      setActiveSet(null);
  }

  return (
    <>
      <div className="mb-6 bg-background/70 backdrop-blur-sm sticky top-20 z-30 p-4 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search sets..."
                    className="pl-9"
                />
            </div>
             <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="latest">Sort by Latest</SelectItem>
                    <SelectItem value="oldest">Sort by Oldest</SelectItem>
                    <SelectItem value="title">Sort by Title (A-Z)</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {filtered.length === 0 && (
          <div className="col-span-full bg-white p-8 rounded-xl text-center shadow-sm border-dashed">
            <h3 className="text-xl font-semibold text-gray-800">No MCQ Sets Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
      )}

      {filtered.length > 0 && (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
              {filtered.map((set) => (
                  <McqSetCard key={set.id} set={set} onStart={() => openPlayer(set)} />
              ))}
          </div>
      )}

      {activeSet && <MCQPlayer setData={activeSet} onClose={closePlayer} />}
    </>
  );
}
