"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function McqPlayerPage() {
  const { id } = useParams();
  const router = useRouter();

  // Data state
  const [setData, setSetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load MCQ set
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetch(`/api/a2gadmin/mcq?id=${id}`);
        const data = await res.json();
        if (data?.set) setSetData(data.set);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!setData) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load MCQ Set.
      </div>
    );
  }

  const questions = setData.questions || [];
  const total = questions.length;
  const current = questions[currentIndex];

  function selectOption(opt: string) {
    if (selectedOption) return;
    setSelectedOption(opt);
    if (opt === current.correctAnswer) setScore((s) => s + 1);
  }

  function next() {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  }

  function restart() {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResults(false);
  }

  if (total === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">{setData.title}</h1>
        <p className="text-gray-600 mb-4">{setData.description}</p>

        <div className="border bg-white p-6 rounded-lg shadow text-center">
          <p className="text-lg">This MCQ set has no questions yet.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold">Quiz Completed!</h1>
        <p className="text-gray-600 text-lg mb-6">
          You scored {score} out of {total}
        </p>

        <Button onClick={restart} className="mb-6">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>

        <div className="text-left space-y-4">
          {questions.map((q: any, i: number) => (
            <div key={i} className="p-4 bg-white shadow border rounded-lg">
              <p className="font-semibold">{i + 1}. {q.question}</p>
              <p className="text-green-700 text-sm">
                Correct Answer: {q.correctAnswer}
              </p>
              <p className="text-gray-500 text-xs">{q.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // QUIZ UI
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{setData.title}</h1>
      <p className="text-gray-600 mb-6">{setData.description}</p>

      <div className="border p-6 rounded-lg shadow bg-white">
        <h2 className="text-lg font-semibold mb-3">
          Question {currentIndex + 1} of {total}
        </h2>

        <p className="text-md font-medium mb-6">{current.question}</p>

        <div className="space-y-3">
          {current.options.map((opt: string, i: number) => {
            const correct = opt === current.correctAnswer;
            const wrong = selectedOption === opt && !correct;

            return (
              <button
                key={i}
                onClick={() => selectOption(opt)}
                disabled={!!selectedOption}
                className={`p-4 w-full text-left rounded-lg border transition
                  ${
                    selectedOption
                      ? correct
                        ? "bg-green-600 text-white border-green-700"
                        : wrong
                        ? "bg-red-600 text-white border-red-700"
                        : "bg-gray-100 border-gray-300"
                      : "bg-white hover:bg-purple-50 border-gray-300"
                  }
                `}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {selectedOption && (
        <div className="mt-6 flex justify-between items-center bg-indigo-50 border p-4 rounded-lg">
          <p className="text-sm font-medium text-indigo-800">{current.explanation}</p>
          <Button onClick={next}>
            {currentIndex === total - 1 ? "Show Results" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
