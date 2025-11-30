
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";

interface McqSet {
  id: string;
  title: string;
  subject: string;
  course: string;
  year: string;
  description?: string;
  questionCount: number;
  isPremium?: boolean;
  createdAt?: any;
  questions?: any[];
}

interface McqContextType {
  mcqSets: McqSet[];
  loading: boolean;
  getById: (id: string) => McqSet | undefined;
  refresh: () => void;
}

const McqContext = createContext<McqContextType>({
  mcqSets: [],
  loading: true,
  getById: () => undefined,
  refresh: () => {},
});

export function McqProvider({ children }: { children: ReactNode }) {
  const [mcqSets, setMcqSets] = useState<McqSet[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const ref = collection(db, "mcqSets");
      const snap = await getDocs(ref);

      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as McqSet[];
      setMcqSets(list);
    } catch(err) {
      console.error("MCQ refresh error", err)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ref = collection(db, "mcqSets");

    // Live update listener
    const unsubscribe = onSnapshot(ref, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as McqSet[];
      setMcqSets(list);
      setLoading(false);
    }, (err) => {
      console.error("MCQ onSnapshot error", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getById = (id: string) => {
    return mcqSets.find(s => s.id === id);
  }

  return (
    <McqContext.Provider value={{ mcqSets, loading, getById, refresh }}>
      {children}
    </McqContext.Provider>
  );
}

export function useMcqSets() {
  return useContext(McqContext);
}
