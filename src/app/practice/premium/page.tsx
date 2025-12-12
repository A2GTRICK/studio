
// src/app/practice/premium/page.tsx (Server Component)
import React from 'react';
import { fetchAllMCQSets, type MCQSet } from '@/services/mcq';
import McqPracticeClient from '@/components/McqPracticeClient';
import { BookCopy } from 'lucide-react';

export default async function PremiumPracticePage() {
  const sets = await fetchAllMCQSets();
  
  return (
    <div className="bg-[#F8F5FF] min-h-screen">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="mb-8 text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-4 rounded-full mb-4">
                <BookCopy className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-gray-900">
                Premium MCQ Practice
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Challenge yourself with our collection of high-yield question sets designed for competitive exams.
            </p>
        </header>

        <McqPracticeClient initialSets={sets} />
      </div>
    </div>
  );
}
