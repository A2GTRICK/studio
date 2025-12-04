
// src/components/McqSetCard.tsx
import Link from "next/link";
import React from "react";
import type { McqSet } from "@/types/mcq-set";

export default function McqSetCard({ set }: { set: McqSet }) {
  const locked = set.isPremium;
  return (
    <article className="group bg-white rounded-2xl p-5 shadow-lg border border-purple-200/80 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:border-purple-300 hover:-translate-y-1">
      <div className="flex-grow">
        <div className="flex gap-4 items-start">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">{set.title?.[0] || "M"}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{set.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{set.description}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 items-center">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">{set.course}</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">{set.year || 'All Years'}</span>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">{set.questionCount || (set.questions?.length || 0)} Questions</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm text-purple-600 font-semibold">#{set.subject}</div>
        {locked ? (
          <div className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-200 text-gray-500 cursor-not-allowed">Premium</div>
        ) : (
          <Link href={`/dashboard/mcq-practice/${set.id}`} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-md hover:opacity-90 transition-opacity">Start Practice</Link>
        )}
      </div>
    </article>
  );
}
