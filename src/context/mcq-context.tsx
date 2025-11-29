
// src/context/mcq-context.tsx
"use client";
import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topic?: string;
  difficulty?: string;
  id?: string;
};

export type McqSet = {
  id: string;
  title: string;
  description?: string;
  course?: string;
  subject?: string;
  year?: string;
  isPremium?: boolean;
  questionCount?: number;
  questions: Question[];
  createdAt?: any;
  updatedAt?: any;
};

type McqContextType = {
  mcqSets: McqSet[];
  loading: boolean;
  refresh: () => void;
  getById: (id: string) => McqSet | undefined;
};

const McqContext = createContext<McqContextType>({
  mcqSets: [],
  loading: true,
  refresh: () => {},
  getById: () => undefined,
});

export const McqProvider = ({ children }: { children: ReactNode }) => {
  const [mcqSets, setMcqSets] = useState<McqSet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMcqSets = () => {
    setLoading(true);
    const colRef = collection(db, "mcqSets");

    const unsubscribe = onSnapshot(colRef, 
      (snap) => {
        const data: McqSet[] = snap.docs.map((d) => {
          const raw = d.data() as any;
          return {
            id: d.id,
            title: (raw.title || "Untitled MCQ Set").toString(),
            description: raw.description || "",
            course: raw.course || raw.category || "General",
            subject: raw.subject || "",
            year: raw.year || "",
            isPremium: !!raw.isPremium,
            questionCount: raw.questionCount || (Array.isArray(raw.questions) ? raw.questions.length : 0),
            questions: Array.isArray(raw.questions) ? raw.questions : [],
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
          };
        });
        console.info("[mcq-context] fetched", data.length, "mcqSets");
        setMcqSets(data);
        setLoading(false);
      },
      (error) => {
        console.error("[mcq-context] failed to fetch mcqSets:", error);
        
        const permissionError = new FirestorePermissionError({
          path: colRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        setMcqSets([]);
        setLoading(false);
      }
    );
    return unsubscribe;
  };

  useEffect(() => {
    const unsub = fetchMcqSets();
    return () => unsub && unsub();
  }, []);

  const value = useMemo(
    () => ({
      mcqSets,
      loading,
      refresh: fetchMcqSets,
      getById: (id: string) => mcqSets.find((m) => m.id === id),
    }),
    [mcqSets, loading]
  );

  return <McqContext.Provider value={value}>{children}</McqContext.Provider>;
};

export const useMcqSets = () => useContext(McqContext);
