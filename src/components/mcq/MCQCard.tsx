
import React from "react";
import type { MCQSet } from "@/services/mcq";

type Props = {
  set: MCQSet;
  onStart?: () => void;
};

export default function MCQCard({ set: data, onStart }: Props) {
  const total = Array.isArray(data.questions) ? data.questions.length : 0;
  const attempted = (() => {
    try {
      if (typeof window === 'undefined') return 0;
      const raw = localStorage.getItem(`mcq_attempt_${data.id}`);
      if (!raw) return 0;
      const st = JSON.parse(raw);
      return st?.scoreCount ?? 0;
    } catch {
      return 0;
    }
  })();

  return (
    <article className="bg-white border rounded-xl p-4 shadow flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{data.title}</h3>
          <div className="text-sm text-gray-500">{data.subject || "General"} • {data.course || "—"}</div>
        </div>

        <div className="text-xs text-gray-400 text-right">
          <div>{total} Q</div>
          <div className="mt-2">{data.timeLimit ? `${data.timeLimit} min` : "No time"}</div>
        </div>
      </div>

      {data.description && <p className="text-sm text-gray-700 mt-3 line-clamp-3">{data.description}</p>}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onStart}
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Start
        </button>

        <div className="ml-auto text-sm text-gray-500">
          {attempted ? <span>Last score: {attempted}</span> : <span>Not attempted</span>}
        </div>
      </div>
    </article>
  );
}
