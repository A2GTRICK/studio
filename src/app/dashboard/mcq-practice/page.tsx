
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { fetchAllMCQSets, type MCQSet } from "@/services/mcq";
import { Loader2, Search, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import MCQPlayer from "@/components/mcq/MCQPlayer";
import McqSetCard from "@/components/mcq/MCQCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


export default function MCQPracticePage() {
  const [sets, setSets] = useState<MCQSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [course, setCourse] = useState("all");
  const [onlyUnattempted, setOnlyUnattempted] = useState(false);
  
  const [activeSet, setActiveSet] = useState<MCQSet | null>(null);
  const [lockedSet, setLockedSet] = useState<MCQSet | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllMCQSets();
        setSets(data);
      } catch (e: any) {
        console.error(e);
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const subjects = useMemo(() => {
    const s = Array.from(new Set(sets.map((p) => p.subject).filter(Boolean)));
    return ["all", ...s];
  }, [sets]);

  const courses = useMemo(() => {
    const c = Array.from(new Set(sets.map((p) => p.course).filter(Boolean)));
    return ["all", ...c];
  }, [sets]);

  const filtered = useMemo(() => {
    let f = sets.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      f = f.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(q) ||
          (s.subject || "").toLowerCase().includes(q) ||
          (s.course || "").toLowerCase().includes(q)
      );
    }
    if (subject !== "all") f = f.filter((s) => s.subject === subject);
    if (course !== "all") f = f.filter((s) => s.course === course);

    if (onlyUnattempted) {
      f = f.filter((s) => {
        try {
          const key = `mcq_attempt_${s.id}`;
          if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(key);
            return !raw;
          }
          return true;
        } catch {
          return true;
        }
      });
    }

    return f;
  }, [sets, query, subject, course, onlyUnattempted]);

  function openPlayer(set: MCQSet) {
    try {
        const key = `mcq_attempt_${set.id}`;
        if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(key);
            if(raw) {
                const data = JSON.parse(raw);
                if ((data.attempts || 0) >= 3) {
                    setLockedSet(set);
                    return;
                }
            }
        }
    } catch {}
    setActiveSet(set);
  }
  
  function closePlayer() {
    setActiveSet(null);
  }
  
  function closeLockModal() {
      setLockedSet(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center p-10">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-extrabold tracking-tight">MCQ Practice</h1>
            <p className="text-muted-foreground mt-1">Practice MCQs — timed tests, progress, and review.</p>
        </header>

        <div className="bg-card p-4 rounded-xl border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sets, subjects, courses..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                         {subjects.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Subjects" : s}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                       {courses.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All Courses" : c}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <div className="flex items-center space-x-2 justify-end lg:col-span-4">
                    <Checkbox id="unattempted" checked={onlyUnattempted} onCheckedChange={(c) => setOnlyUnattempted(c as boolean)} />
                    <Label htmlFor="unattempted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                       Show unattempted only
                    </Label>
                </div>
            </div>
        </div>

        {filtered.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed">
            <h2 className="text-xl font-semibold text-gray-700">No MCQ Sets Found</h2>
            <p className="mt-2 text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
        ) : (
             <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                {filtered.map((s) => (
                    <McqSetCard
                    key={s.id}
                    set={s}
                    onStart={() => openPlayer(s)}
                    />
                ))}
            </div>
        )}

        {activeSet && <MCQPlayer setData={activeSet} onClose={closePlayer} />}

        <Dialog open={!!lockedSet} onOpenChange={(isOpen) => !isOpen && setLockedSet(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Lock /> Attempts Limit Reached</DialogTitle>
                    <DialogDescription className="pt-4">
                        You have used all your free attempts for the set: <span className="font-bold">{lockedSet?.title}</span>.
                        <br/><br/>
                        Upgrade to Pro to get unlimited access to all MCQ sets, or purchase this set individually.
                    </DialogDescription>
                </DialogHeader>
                 <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={closeLockModal}>Maybe Later</Button>
                    <Button onClick={() => router.push('/dashboard/billing')}>Upgrade to Pro</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
