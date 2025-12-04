
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/firebase/config";

export interface McqSet {
  id: string;
  title: string;
  subject: string;
  course: string;
  year: string;
  description?: string;
  questionCount: number;
  isPremium?: boolean;
  isPublished?: boolean;
  createdAt?: any;
  updatedAt?: any;
  questions?: any[];
}

interface McqContextType {
  mcqSets: McqSet[];
  loading: boolean;
  error?: string | null;
  getById: (id: string) => McqSet | undefined;
  refresh: () => void;
}

const McqContext = createContext<McqContextType>({
  mcqSets: [],
  loading: true,
  error: null,
  getById: () => undefined,
  refresh: () => {},
});

export function McqProvider({ children }: { children: ReactNode }) {
  const [mcqSets, setMcqSets] = useState<McqSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetSets = async () => {
    try {
        setLoading(true);
        setError(null);
        // Query only published sets for the client-side
        const q = query(
            collection(db, "mcqSets"), 
            where("isPublished", "==", true),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as McqSet[];
        setMcqSets(list);
    } catch (err: any) {
        console.error("MCQ fetch error", err);
        setError("Could not load MCQ sets. The database might be offline or rules are blocking access.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetSets();
  }, []);

  const getById = (id: string) => {
    return mcqSets.find(s => s.id === id);
  }
  
  const refresh = () => {
    fetchAndSetSets();
  }

  return (
    <McqContext.Provider value={{ mcqSets, loading, error, getById, refresh }}>
      {children}
    </McqContext.Provider>
  );
}

export function useMcqSets() {
  return useContext(McqContext);
}
