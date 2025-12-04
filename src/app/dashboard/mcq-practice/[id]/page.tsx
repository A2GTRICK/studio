"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function McqPracticeSetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [setData, setSetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadSet() {
      try {
        const res = await fetch(`/api/a2gadmin/mcq?id=${id}`);
        const data = await res.json();

        if (data?.set) {
          setSetData(data.set);
        }
      } catch (error) {
        console.error("Failed to load MCQ set:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSet();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  if (!setData)
    return (
      <div className="p-6 text-center text-red-500">
        MCQ Set not found or failed to load.
      </div>
    );

  const questions = setData.questions || [];
  const totalQuestions = questions.length;
  const current = questions[currentIndex];

  function handleSelectOption(opt: string) {
    if (selectedOption) return;

    setSelectedOption(opt);

    if (opt === current.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNextQuestion() {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
    }
  }

  function restartQuiz() {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResults(false);
  }

  // No Questions Case
  if (totalQuestions === 0)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">{setData.title}</h1>
        <p className="text-gray-600 mb-6">{setData.description}</p>
        <div className="border rounded-lg p-8 shadow text-center bg-white">
          <p className="text-lg font-medium mb-4">
            This MCQ set does not contain any questions yet.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    );

  // Results Page
  if (showResults)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-2">Quiz Completed!</h1>
        <p className="text-lg text-center text-gray-600 mb-6">
          You scored {score} out of {totalQuestions}.
        </p>

        <div className="text-center mb-8">
          <Button onClick={restartQuiz}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((q: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
              <p className="font-semibold">
                {index + 1}. {q.question}
              </p>
              <p className="mt-2 text-sm text-green-700">
                Correct Answer: {q.correctAnswer}
              </p>
              {q.explanation && (
                <p className="text-xs text-gray-500 mt-2">{q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );

  // Question Page
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{setData.title}</h1>
      <p className="text-gray-600 mb-6">{setData.description}</p>

      <div className="border rounded-lg p-6 shadow bg-white">
        <h2 className="font-semibold text-lg mb-4">
          Question {currentIndex + 1} of {totalQuestions}
        </h2>

        <p className="text-md font-medium mb-6">{current.question}</p>

        <div className="flex flex-col gap-3">
          {current.options.map((opt: string, index: number) => (
            <button
              key={index}
              onClick={() => handleSelectOption(opt)}
              className={`p-4 rounded-lg border transition-all text-left
                ${
                  selectedOption
                    ? opt === current.correctAnswer
                      ? "bg-green-600 text-white border-green-700"
                      : opt === selectedOption
                      ? "bg-red-600 text-white border-red-700"
                      : "bg-gray-100 border-gray-300"
                    : "bg-white hover:bg-purple-50 border-gray-300"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {selectedOption && (
        <div className="mt-6 flex justify-between items-center p-4 rounded-lg bg-indigo-50 border border-indigo-200">
          <p className="text-sm font-medium text-indigo-800">
            {current.explanation}
          </p>
          <Button onClick={handleNextQuestion}>
            {currentIndex === totalQuestions - 1 ? "Show Results" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
