
'use client';

import { Button } from "@/components/ui/button";
import { Star, Timer, BookOpen, Play } from "lucide-react";

export type MockTest = {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  duration?: number;
  isPremium?: boolean;
  questions?: any[];
  questionCount?: number; // Added field
};

export default function MockTestCard({ test }: { test: MockTest }) {
  const questionCount = Array.isArray(test.questions) ? test.questions.length : 0;
  const isReady = questionCount > 0;

  return (
    <div
      className="bg-gradient-to-br from-white to-purple-50/50 border border-purple-100 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 leading-tight">{test.title}</h3>
          <div className="flex-shrink-0 ml-2 space-x-2">
            {!isReady && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                Coming Soon
              </span>
            )}
            {test.isPremium && (
             <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <Star className="w-3.5 h-3.5" />
                Premium
              </span>
            )}
          </div>
        </div>

        <p className="text-sm font-semibold text-primary/90">
          {test.subject}
        </p>
      </div>
      <div className="mt-auto bg-purple-50/40 p-5 border-t border-purple-100">
         <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary/70" />
            <div>
                <p className="font-semibold text-gray-800">{questionCount}</p>
                <p className="text-xs">Questions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary/70" />
             <div>
                <p className="font-semibold text-gray-800">{test.duration ?? "—"}</p>
                <p className="text-xs">Minutes</p>
            </div>
          </div>
        </div>
        <Button
          className="w-full font-bold"
          disabled={!isReady}
          onClick={() => {
              if (isReady) {
                  window.location.href = `/dashboard/mock-test/${test.id}/instruction`;
              }
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          {isReady ? "Start Mock Test" : "Coming Soon"}
        </Button>
      </div>
    </div>
  );
}
