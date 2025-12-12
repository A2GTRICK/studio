// src/components/practice-premium/PremiumCardV3.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, BarChart2, Play } from "lucide-react";
import type { MCQSet } from "@/services/mcq";

type Props = {
  set: MCQSet;
  analytics?: any;
  onClick: () => void;
};

export default function PremiumCardV3({ set, analytics, onClick }: Props) {
  const lastScore = analytics?.score;
  const attempts = analytics?.attempts || 0;
  const avgTime = analytics?.avgTime;

  return (
    <motion.div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden cursor-pointer group"
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-900 leading-tight pr-4">{set.title}</h3>
          {set.isPremium && <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {set.subject} • {set.course}
        </div>
        <div className="text-xs text-gray-400 mt-1">{set.questions.length} Questions</div>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t flex justify-between items-center text-xs">
        {lastScore !== undefined ? (
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" />
            <span className="font-semibold">Last Score: {lastScore}%</span>
          </div>
        ) : (
          <div className="text-gray-500">Not Attempted</div>
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500 text-white group-hover:bg-blue-600 transition-colors">
          <Play className="w-4 h-4" />
          <span className="font-semibold">Practice</span>
        </div>
      </div>
    </motion.div>
  );
}
