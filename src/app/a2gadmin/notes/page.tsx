
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

interface Note {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  course?: string;
  year?: string;
  isPremium?: boolean;
  updatedAt: any; 
}

export default function NotesDashboard() {
  const router = useRouter();

  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  async function loadNotes() {
      setLoading(true);
      try {
        const notesRef = collection(db, "notes");
        const q = query(notesRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Note));
        setAllNotes(notes);

        if (Array.isArray(notes)) {
            const subjects = Array.from(new Set(notes.map((n: Note) => n.subject || "General")));
            const initialExpansion: Record<string, boolean> = {};
            subjects.forEach(sub => { initialExpansion[sub] = true; });
            setExpandedSubjects(initialExpansion);
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
      }
      setLoading(false);
    }

  useEffect(() => {
    loadNotes();
  }, []);
  
  const toggleSubjectExpansion = (subject: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
  };

  const groupedAndSortedNotes = useMemo(() => {
    let filtered = [...allNotes];

    if (search.trim() !== "") {
      filtered = filtered.filter((n) =>
        `${n.title} ${n.subject} ${n.topic}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (premiumFilter === "premium") {
      filtered = filtered.filter((n) => n.isPremium === true);
    } else if (premiumFilter === "free") {
      filtered = filtered.filter((n) => !n.isPremium);
    }

    const grouped = filtered.reduce((acc, note) => {
      const subject = note.subject || "General";
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(note);
      return acc;
    }, {} as Record<string, Note[]>);

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
  }, [allNotes, search, premiumFilter, sortBy]);
  
  const orderedSubjects = Object.keys(groupedAndSortedNotes).sort();

  async function handleDelete(noteId: string) {
    if (!confirm("Are you sure you want to delete this note permanently?")) return;
    await deleteDoc(doc(db, "notes", noteId));
    setAllNotes(allNotes.filter(n => n.id !== noteId));
    alert("Note deleted successfully!");
  }
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date';
    const dateValue = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    if (isNaN(dateValue.getTime())) return 'Invalid Date';
    return dateValue.toLocaleDateString('en-IN');
  };

  if (loading) return <div className="p-6 text-center flex items-center justify-center gap-2"><Loader2 className="w-6 h-6 animate-spin" />Loading your notes library...</div>;

  return (
    <div className="p-4 md:p-0 max-w-7xl mx-auto text-foreground">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notes Manager</h1>
           <p className="text-sm text-muted-foreground">Create, edit, and manage all your notes.</p>
        </div>
        <Link href="/a2gadmin/notes/create" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition">
          <PlusCircle className="w-5 h-5" />
          Create New Note
        </Link>
      </div>


      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-secondary/50 rounded-xl border">
        <input
          type="text"
          placeholder="Search notes..."
          className="border p-2 rounded-lg w-full sm:w-auto flex-grow bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded-lg bg-card"
          value={premiumFilter}
          onChange={(e) => setPremiumFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="premium">Premium Only</option>
          <option value="free">Free Only</option>
        </select>
        <select
          className="border p-2 rounded-lg bg-card"
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
          <p className="text-center text-muted-foreground mt-10">No notes found matching your criteria.</p>
        )}
        
        {orderedSubjects.map(subject => (
           <section key={subject} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-4 bg-secondary/50 border-b"
                  onClick={() => toggleSubjectExpansion(subject)}
                >
                    <h3 className="text-lg font-bold">{subject}</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">{groupedAndSortedNotes[subject].length} notes</span>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedSubjects[subject] ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {expandedSubjects[subject] && (
                  <div className="p-4 md:p-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedAndSortedNotes[subject].map((note) => (
                      <div
                        key={note.id}
                        className="border rounded-xl shadow-sm hover:shadow-lg transition bg-background p-4 flex flex-col cursor-pointer"
                        onClick={() => router.push(`/a2gadmin/notes/edit/${note.id}`)}
                      >
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="font-semibold text-base leading-tight flex-1 pr-2">{note.title}</h2>
                            {note.isPremium && (
                              <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">Premium</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{note.topic || note.course}</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground mb-3">
                            Updated: {formatDate(note.updatedAt)}
                          </p>
                          <div className="flex justify-end gap-2">
                             <button
                                className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/a2gadmin/notes/edit/${note.id}`);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="px-3 py-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  handleDelete(note.id);
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
