
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function McqPracticeSetPage() {
  const { id } = useParams();
  const [setData, setSetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  // Fetch MCQ Set
  useEffect(() => {
    if (!id) return;

    async function loadSet() {
      try {
        const res = await fetch(`/api/a2gadmin/mcq?id=${id}`);
        const data = await res.json();

        if (data?.set) {
          setSetData(data.set);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading MCQ set:", err);
        setLoading(false);
      }
    }

    loadSet();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!setData) return <div className="p-6">MCQ Set not found.</div>;

  const questions = setData.questions || [];
  const total = questions.length;
  const current = questions[currentIndex];

  function checkAnswer(option: string) {
    setSelected(option);
    setShowAnswer(true);
  }

  function nextQuestion() {
    setSelected(null);
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1 < total ? prev + 1 : prev));
  }

  // Handle case where questions might be empty
  if (!current) {
    return (
       <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-2">{setData.title}</h1>
          <p className="text-gray-600 mb-6">{setData.description}</p>
          <div className="border rounded-lg p-4 shadow text-center">
            <p className="text-md font-medium mb-4">This MCQ set does not contain any questions yet.</p>
          </div>
       </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{setData.title}</h1>
      <p className="text-gray-600 mb-6">{setData.description}</p>

      <div className="border rounded-lg p-4 shadow">
        <h2 className="font-semibold text-lg mb-4">
          Question {currentIndex + 1} of {total}
        </h2>

        <p className="text-md font-medium mb-4">{current.question}</p>

        <div className="flex flex-col gap-3">
          {current.options.map((opt: string, index: number) => {
            const isCorrect = opt === current.correctAnswer;

            return (
              <button
                key={index}
                onClick={() => checkAnswer(opt)}
                className={`p-3 rounded border text-left ${
                  showAnswer
                    ? isCorrect
                      ? "bg-green-200 border-green-500"
                      : selected === opt
                      ? "bg-red-200 border-red-500"
                      : "bg-gray-100"
                    : "bg-white hover:bg-gray-100"
                }`}
                disabled={showAnswer}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded">
            <strong>Correct Answer:</strong> {current.correctAnswer}
            {current.explanation && <p className="text-sm mt-1">{current.explanation}</p>}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={nextQuestion}
            disabled={currentIndex + 1 >= total}
            className="px-6 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
