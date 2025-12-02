// src/context/mcq-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  limit,
  Query,
  FirestoreError,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { docToPlain, docsToPlain } from "@/lib/firestore-helpers";

type McqSet = any;

const McqContext = createContext<{
  loading: boolean;
  sets: McqSet[];
  error?: string | null;
  getById: (id: string) => McqSet | undefined;
  refresh: () => Promise<void>;
}>({ loading: true, sets: [], error: null, getById: () => undefined, refresh: async () => {} });

export function McqProvider({ children }: { children: React.ReactNode }) {
  const [sets, setSets] = useState<McqSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // snapshot listener for live updates (safe)
  useEffect(() => {
    if (!db) {
      setError("Firestore is not initialized.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "mcqSets"),
      orderBy("createdAt", "desc")
    ) as Query;

    // onSnapshot with error handling: permission-denied will be caught here and we store in state rather than crash
    const unsub = onSnapshot(
      q,
      (snap) => {
        try {
          const plain = docsToPlain(snap.docs);
          setSets(plain);
          setLoading(false);
        } catch (err) {
          console.error("mcq-context: failed to parse snapshot", err);
          setError("Failed to parse data");
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error("mcq-context snapshot error:", err);
        // Graceful handling: provide message for UI and fallback to manual fetch
        setError(err.message || "Firestore snapshot error");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // manual refresh (useful fallback)
  async function refresh() {
    if (!db) {
       setError("Firestore is not initialized.");
       return;
    }
    try {
      setLoading(true);
      setError(null);
      const q = query(
        collection(db, "mcqSets"),
        orderBy("createdAt", "desc"),
        limit(100)
      ) as Query;
      const snap = await getDocs(q);
      const plain = docsToPlain(snap.docs);
      setSets(plain);
    } catch (err: any) {
      console.error("mcq-context refresh error:", err);
      setError(err?.message || "Failed to fetch mcq sets");
    } finally {
      setLoading(false);
    }
  }

  const getById = (id: string) => {
    return sets.find(s => s.id === id);
  }

  return (
    <McqContext.Provider value={{ loading, sets, error, getById, refresh }}>
      {children}
    </McqContext.Provider>
  );
}

export const useMcqSets = () => useContext(McqContext);
