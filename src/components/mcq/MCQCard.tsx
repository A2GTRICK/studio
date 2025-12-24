
"use client";

import React from "react";
import type { MCQSet } from "@/services/mcq";
import { Button } from "../ui/button";
import { Play, Star } from "lucide-react";

type Props = {
  set: MCQSet;
  onStart?: () => void;
};

export default function McqSetCard({ set: data, onStart }: Props) {
  const total = Array.isArray(data.questions) ? data.questions.length : 0;
  const isPremium = data.isPremium === true;

  let attemptStatus = {
    text: "Not attempted",
    color: "text-muted-foreground",
  };
  
  // This logic must run on the client, so we check for `window`
  if (typeof window !== 'undefined') {
    try {
      const key = `mcq_attempt_log_${data.id}`;
      // Find the most recent attempt
      let mostRecentAttempt = null;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(key)) {
           const item = JSON.parse(localStorage.getItem(k) || '{}');
           if (!mostRecentAttempt || new Date(item.date) > new Date(mostRecentAttempt.date)) {
               mostRecentAttempt = item;
           }
        }
      }

      if (mostRecentAttempt) {
        attemptStatus = {
          text: `Last Score: ${mostRecentAttempt.score}/${mostRecentAttempt.total}`,
          color: "text-blue-600 font-medium",
        };
      }
    } catch {
      // If parsing fails, default to "Not attempted"
    }
  }


  return (
    <article className="group bg-card rounded-2xl p-5 shadow-lg border border-primary/10 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-primary/30 hover:-translate-y-1 h-full">
      <div className="flex-grow">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-headline text-lg font-bold text-gray-900 leading-tight pr-2">
            {data.title}
          </h3>
          {isPremium && (
            <div className="flex-shrink-0 p-1.5 rounded-full bg-amber-100 text-amber-600" title="Premium Set">
              <Star className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{data.course || "General"}</span>
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-medium">{data.subject}</span>
        </div>

        {data.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{data.description}</p>}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm">
          <p className="font-semibold">{total} Questions</p>
          <p className={`text-xs ${attemptStatus.color}`}>{attemptStatus.text}</p>
        </div>
        <Button onClick={onStart}>
          <Play className="mr-2 h-4 w-4" />
          Start
        </Button>
      </div>
    </article>
  );
}
