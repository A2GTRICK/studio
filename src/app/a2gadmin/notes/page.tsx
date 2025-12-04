"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function NotesDashboard() {
  const router = useRouter();

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search + Filter + Sorting states
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [premiumFilter, setPremiumFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Load notes
  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch("/api/a2gadmin/notes");
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (error) {
        console.error("Failed to load notes:", error);
      }
      setLoading(false);
    }

    loadNotes();
  }, []);

  // Unique subjects list
  const subjects = useMemo(() => {
    const setList = new Set(notes.map((n) => n.subject));
    return ["all", ...Array.from(setList)];
  }, [notes]);

  // Filter + Search + Sort Logic
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];

    // Search filter
    if (search.trim() !== "") {
      filtered = filtered.filter((n) =>
        `${n.title} ${n.subject} ${n.topic}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter((n) => n.subject === subjectFilter);
    }

    // Premium filter
    if (premiumFilter === "premium") {
      filtered = filtered.filter((n) => n.isPremium === true);
    }
    if (premiumFilter === "free") {
      filtered = filtered.filter((n) => !n.isPremium);
    }

    // Sorting
    if (sortBy === "latest") {
      filtered.sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => Number(a.updatedAt) - Number(b.updatedAt));
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [notes, search, subjectFilter, premiumFilter, sortBy]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notes Manager</h1>

      {/* Top Control Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search notes..."
          className="border p-2 rounded w-full sm:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Subject Filter */}
        <select
          className="border p-2 rounded"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub === "all" ? "All Subjects" : sub}
            </option>
          ))}
        </select>

        {/* Premium Filter */}
        <select
          className="border p-2 rounded"
          value={premiumFilter}
          onChange={(e) => setPremiumFilter(e.target.value)}
        >
          <option value="all">All Notes</option>
          <option value="premium">Premium Only</option>
          <option value="free">Free Only</option>
        </select>

        {/* Sorting */}
        <select
          className="border p-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="latest">Latest Updated</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      {/* Notes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="border rounded-xl shadow hover:shadow-lg transition bg-white p-4 cursor-pointer"
            onClick={() => router.push(`/a2gadmin/notes/view/${note.id}`)}
          >
            <div className="flex justify-between mb-2">
              <h2 className="font-semibold text-lg">{note.title}</h2>
              {note.isPremium && (
                <span className="text-xs bg-yellow-300 px-2 rounded">Premium</span>
              )}
            </div>

            <p className="text-sm text-gray-600">{note.subject}</p>
            <p className="text-sm text-gray-600">{note.topic}</p>

            <p className="text-xs text-gray-400 mt-2">
              Updated: {new Date(Number(note.updatedAt)).toLocaleDateString()}
            </p>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/a2gadmin/notes/edit/${note.id}`);
                }}
              >
                Edit
              </button>

              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm("Delete this note?")) return;

                  await fetch(`/api/a2gadmin/notes?id=${note.id}`, {
                    method: "DELETE",
                  });

                  alert("Note deleted!");
                  location.reload();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No notes found.</p>
      )}
    </div>
  );
}
