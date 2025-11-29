"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

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
  reload: () => void;
}

const McqContext = createContext<McqContextType>({
  mcqSets: [],
  loading: true,
  reload: () => {},
});

export function McqProvider({ children }: { children: ReactNode }) {
  const [mcqSets, setMcqSets] = useState<McqSet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMCQ = async () => {
    try {
      setLoading(true);
      const ref = collection(db, "mcqSets");
      const snap = await getDocs(ref);

      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as McqSet[];
      setMcqSets(list);
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
    });

    return () => unsubscribe();
  }, []);

  return (
    <McqContext.Provider value={{ mcqSets, loading, reload: loadMCQ }}>
      {children}
    </McqContext.Provider>
  );
}

export function useMcqSets() {
  return useContext(McqContext);
}