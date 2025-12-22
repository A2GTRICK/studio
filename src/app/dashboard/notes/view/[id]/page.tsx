
"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import Image from "next/image";

import { db } from "@/firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

import { ArrowLeft, Share2, FileDown, BookText, Menu } from "lucide-react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { trackNoteView } from "@/services/trackNoteView";
import PremiumGuard from "@/components/premium/PremiumGuard";

// THEME
const THEME = {
  pageBg: "bg-[#F5F1FF]",
  card: "bg-white rounded-2xl shadow-xl border border-[#E5DAFF]",
  accent: "text-[#6B21A8]",
  accentBg: "bg-[#EAD8FF]",
};

// ✅ ADD — helpers
function hasActivePremium(userData: any) {
  if (!userData) return false;
  if (userData.isLifetime) return true;
  if (!userData.premiumUntil) return false;
  return new Date(userData.premiumUntil).getTime() >= Date.now();
}

// PREPROCESS EMBEDS
function preprocessContent(raw: string) {
  if (!raw) return "";
  let s = raw;

  s = s.replace(/https?:\/\/drive\.google\.com\/[^\s)]+/g, (m) => {
    const idMatch =
      m.match(/\/d\/([^/]+)\//) || m.match(/id=([^&]+)/);
    const id = idMatch ? idMatch[1] : "";
    if (!id) return m;

    return `
<div class="my-6 p-4 rounded-xl border bg-[#F9F0FF] shadow-sm not-prose">
  <p class="font-semibold text-purple-700">Google Drive File</p>
  <iframe src="https://drive.google.com/file/d/${id}/preview" class="w-full h-72 rounded-lg mt-3"></iframe>
</div>`;
  });

  return s;
}

function sanitizeForRender(dirty: string) {
  if (typeof window === "undefined") return dirty;
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "loading",
      "src",
      "class",
      "style",
    ],
  });
}

export default function PremiumNoteViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user } = useAuthSession() ?? {};

  const [note, setNote] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null); // ✅ ADD
  const [loading, setLoading] = useState(true);
  const [showTOC, setShowTOC] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      try {
        // NOTE
        const ref = doc(db, "notes", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setLoading(false);
          return;
        }

        const data = { id: snap.id, ...snap.data() };
        setNote(data);

        // USER ENTITLEMENTS ✅ ADD
        if (user?.uid) {
          const uSnap = await getDoc(doc(db, "users", user.uid));
          if (uSnap.exists()) setUserData(uSnap.data());

          trackNoteView(user.uid, {
            id: snap.id,
            course: data.course,
            subject: data.subject,
            year: data.year,
          });
        }

        // RELATED NOTES
        const q = query(
          collection(db, "notes"),
          where("course", "==", data.course),
          where("subject", "==", data.subject),
          where("year", "==", data.year),
          limit(5)
        );

        const docs = await getDocs(q);
        setRelated(
          docs.docs
            .filter((d) => d.id !== snap.id)
            .map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (error) {
        console.error("Error fetching note:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, user]);

  const sanitized = useMemo(() => {
    if (!note) return "";
    const processed = preprocessContent(
      note.content || note.short || ""
    );
    return sanitizeForRender(processed);
  }, [note]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading...
      </div>
    );

  if (!note)
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Note Not Found
      </div>
    );

  // ✅ FINAL ACCESS DECISION
  const canAccess =
    note.isPremium !== true ||
    hasActivePremium(userData) ||
    userData?.grantedNoteIds?.includes(note.id);

  const created = new Date(
    note.createdAt?.seconds * 1000 || Date.now()
  );

  return (
    <div className={`${THEME.pageBg} min-h-screen pb-20`}>
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="font-bold text-purple-700 line-clamp-1">
          {note.title}
        </div>
        <button
          onClick={() => setShowTOC(true)}
          className="md:hidden p-2 rounded-lg border text-sm"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:flex gap-10 mt-8">
        <div className="flex-1">
          <Link
            href="/dashboard/notes"
            className="inline-flex items-center text-purple-700 mb-6"
          >
            <ArrowLeft className="mr-2 w-4" /> Back to Notes
          </Link>

          {/* HEADER CARD */}
          <div className={`${THEME.card} p-8 mb-8`}>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {note.title}
            </h1>
            <p className="text-gray-600 mt-2">
              {note.course} • {note.subject} • Year {note.year}
            </p>
            <p className="mt-3 text-gray-700">{note.short}</p>
          </div>

          <PremiumGuard
            isPremium={note.isPremium === true}
            canAccess={canAccess}
            contentType="note"
            contentId={note.id}
            price={20} // Example price, you can make this dynamic
          >
            <div className={`${THEME.card} p-8 prose max-w-none`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {sanitized}
              </ReactMarkdown>
            </div>
          </PremiumGuard>
        </div>

        {/* SIDEBAR */}
        <aside className="hidden lg:block w-72 sticky top-20 h-fit">
          <div className={`${THEME.card} p-6`}>
            <h3 className="font-bold text-lg mb-3">Note Info</h3>
            <p className="text-sm">
              <strong>Author:</strong> pharmA2G Team
            </p>
            <p className="text-sm mt-1">
              <strong>Published:</strong>{" "}
              {created.toLocaleDateString()}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
