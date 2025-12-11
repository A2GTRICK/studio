// src/app/blog/[slug]/client-controls.tsx
"use client";
import React, { useState } from "react";
import { Share2, List, X } from "lucide-react";
import Link from "next/link";

function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function TableOfContents({ headings, onLinkClick }: { headings: any[]; onLinkClick?: () => void }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">On this page</h4>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "pharmA2G Blog Post", url: window.location.href }).catch(() => {});
            }
          }}
          className="inline-flex items-center gap-2 text-sm bg-white px-3 py-1 rounded shadow-sm"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      {headings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sections</p>
      ) : (
        <nav aria-label="Table of contents">
          <ul className="space-y-2 text-sm">
            {headings.map((h, idx) => {
              const id = slugify(h.text);
              return (
                <li key={idx} className={h.level === 3 ? "pl-4" : ""}>
                  <a href={`#${id}`} className="hover:underline text-primary" onClick={onLinkClick}>
                    {h.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default function ClientControls({ headings, title, summary, isDesktop = false }: any) {
  const [open, setOpen] = useState(false);

  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: summary, url: window.location.href });
      } catch {
        // ignore
      }
    } else {
      // fallback: copy URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard");
      } catch {
        // ignore
      }
    }
  };

  if (isDesktop) {
    return (
        <>
            <TableOfContents headings={headings} />
             <div className="mt-4 p-4 border rounded-lg">
                <div className="text-sm font-semibold">Enjoyed this?</div>
                <Link href="/dashboard/billing" className="inline-block w-full text-center bg-primary text-white py-2 rounded mt-3">
                  Subscribe for more
                </Link>
            </div>
        </>
    );
  }

  return (
    <div className="bg-white border rounded-full shadow-md p-2 flex items-center justify-between gap-3">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm"
      >
        <List className="w-4 h-4" /> {headings.length > 0 ? "Contents" : "Menu"}
      </button>

      <div className="flex items-center gap-2">
        <button onClick={onShare} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary text-white text-sm">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      {/* Drawer for mobile TOC */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-lg p-4 max-h-[75%] overflow-auto">
             <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Table of Contents</div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full -mr-2">
                    <X className="h-5 w-5"/>
                </button>
            </div>
            <TableOfContents headings={headings} onLinkClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}