"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface Note {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  course?: string;
  year?: string;
  isPremium?: boolean;
  updatedAt: any; // Can be a number or a Firestore timestamp object
}

export default function NotesDashboard() {
  const router = useRouter();

  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Search + Filter states
  const [search, setSearch] = useState("");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // Load notes
  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch("/api/a2gadmin/notes");
        const data = await res.json();
        setAllNotes(data.notes || []);
        // By default, expand all subject groups
        const subjects = Array.from(new Set(data.notes.map((n: Note) => n.subject || "General")));
        const initialExpansion: Record<string, boolean> = {};
        subjects.forEach(sub => { initialExpansion[sub] = true; });
        setExpandedSubjects(initialExpansion);
      } catch (error) {
        console.error("Failed to load notes:", error);
      }
      setLoading(false);
    }

    loadNotes();
  }, []);
  
  const toggleSubjectExpansion = (subject: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
  };

  // Filter, Sort, and Group Logic
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

    // Group notes by subject
    const grouped = filtered.reduce((acc, note) => {
      const subject = note.subject || "General";
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(note);
      return acc;
    }, {} as Record<string, Note[]>);

    // Sort within each group
    Object.keys(grouped).forEach(subject => {
      grouped[subject].sort((a, b) => {
        const dateA = a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : a.updatedAt;
        const dateB = b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : b.updatedAt;
        
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
    await fetch(`/api/a2gadmin/notes?id=${noteId}`, { method: "DELETE" });
    setAllNotes(allNotes.filter(n => n.id !== noteId));
    alert("Note deleted successfully!");
  }
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date';
    const dateValue = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    if (isNaN(dateValue.getTime())) return 'Invalid Date';
    return dateValue.toLocaleDateString('en-IN');
  };

  if (loading) return <div className="p-6 text-center">Loading your notes library...</div>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6">Notes Manager</h1>

      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl border">
        <input
          type="text"
          placeholder="Search notes..."
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
          <p className="text-center text-gray-500 mt-10">No notes found matching your criteria.</p>
        )}
        
        {orderedSubjects.map(subject => (
           <section key={subject} className="bg-white rounded-xl border border-purple-200/80 shadow-sm overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-4 bg-purple-50/50 border-b border-purple-200/80"
                  onClick={() => toggleSubjectExpansion(subject)}
                >
                    <h3 className="text-lg font-bold text-purple-900">{subject}</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{groupedAndSortedNotes[subject].length} notes</span>
                        <ChevronDown className={`h-5 w-5 text-purple-700 transition-transform ${expandedSubjects[subject] ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {expandedSubjects[subject] && (
                  <div className="p-4 md:p-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedAndSortedNotes[subject].map((note) => (
                      <div
                        key={note.id}
                        className="border rounded-xl shadow-sm hover:shadow-lg transition bg-white p-4 flex flex-col cursor-pointer"
                        onClick={() => router.push(`/a2gadmin/notes/edit/${note.id}`)}
                      >
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h2 className="font-semibold text-base leading-tight flex-1 pr-2">{note.title}</h2>
                            {note.isPremium && (
                              <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">Premium</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{note.topic || note.course}</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-400 mb-3">
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
