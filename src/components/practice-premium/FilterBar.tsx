
// src/components/practice-premium/FilterBar.tsx
"use client";
import React, { useState } from "react";

export default function FilterBar() {
  const [q, setQ] = useState("");
  const [filterPremium, setFilterPremium] = useState<string>("all");

  // This component only emits filter state via URL params or events.
  // Keep simple: update query params so server-side page can re-read if needed.
  const apply = () => {
    const search = new URLSearchParams(window.location.search);
    search.set("q", q || "");
    search.set("premium", filterPremium);
    const url = `${window.location.pathname}?${search.toString()}`;
    window.history.replaceState({}, "", url);
    // client-side listeners or a fetch hook can react. For now it's non-destructive.
    window.dispatchEvent(new Event("a2g:mcq-filter-changed"));
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow border flex gap-3 items-center">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tests, tags, subjects..." className="flex-1 p-2 border rounded-md" />
      <select value={filterPremium} onChange={e=>setFilterPremium(e.target.value)} className="p-2 border rounded-md">
        <option value="all">All</option>
        <option value="free">Free</option>
        <option value="premium">Premium</option>
      </select>
      <button onClick={apply} className="px-4 py-2 bg-[#6B21A8] text-white rounded">Apply</button>
    </div>
  );
}
