// src/app/dashboard/mock-test/[id]/page.tsx (Server Component)

import React from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import MockTestClientPage from "./client-page";
import { notFound } from "next/navigation";

// Define types here to be passed to client component
type Option = string | { text: string };

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: number;
}

interface InitialTestData {
    title: string;
    questions: Question[];
}

// Data fetching on the server
async function getTestData(testId: string): Promise<InitialTestData | null> {
    try {
        const testSnap = await getDoc(doc(db, "test_series", testId));
        if (!testSnap.exists()) {
            return null;
        }

        const title = testSnap.data().title ?? "Mock Test";

        const qSnap = await getDocs(
            collection(db, "test_series", testId, "questions")
        );

        const questions: Question[] = qSnap.docs.map((d) => {
            const q = d.data();
            return {
            id: d.id,
            text:
                q.question?.text ??
                q.text ??
                q.question ??
                "Question text missing",
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: Number(q.correctAnswer ?? q.answer ?? 0),
            };
        });

        return { title, questions };
    } catch (e) {
        console.error("Failed to load test data on server", e);
        return null;
    }
}


export default async function MockTestPage({ params }: { params: { id: string } }) {
    const initialData = await getTestData(params.id);

    if (!initialData) {
        // This will render the not-found page if the test doesn't exist
        notFound();
    }
    
    // Pass server-fetched data to the client component
    return <MockTestClientPage initialData={initialData} testId={params.id} />;
}
