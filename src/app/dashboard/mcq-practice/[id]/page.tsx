
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, CheckCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function McqPracticeSetPage() {
  const { id } = useParams();
  const router = useRouter();

  // Data fetching state
  const [setData, setSetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  
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
      } catch (err) {
        console.error("Error loading MCQ set:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSet();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!setData) {
    return <div className="p-6 text-center text-red-500">MCQ Set not found or failed to load.</div>;
  }
  
  const questions = setData.questions || [];
  const totalQuestions = questions.length;

  const handleSelectOption = (qIndex: number, option: string) => {
    if (showResults) return; // Don't allow changes after submitting
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length !== totalQuestions && !confirm("You have not answered all questions. Are you sure you want to submit?")) {
        return;
    }
    setShowResults(true);
  };
  
  const restartQuiz = () => {
      setCurrentIndex(0);
      setAnswers({});
      setShowResults(false);
  }

  const score = questions.reduce((acc: number, q: any, index: number) => {
    return q.correctAnswer === answers[index] ? acc + 1 : acc;
  }, 0);

  if (totalQuestions === 0) {
      return (
         <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-2">{setData.title}</h1>
          <p className="text-gray-600 mb-6">{setData.description}</p>
          <div className="border rounded-lg p-8 shadow text-center bg-white">
            <p className="text-lg font-medium mb-4">This MCQ set does not contain any questions yet.</p>
             <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
       </div>
      )
  }

  if (showResults) {
    return (
        <div className="max-w-3xl mx-auto p-6">
             <h1 className="text-3xl font-bold text-center mb-2">Quiz Results</h1>
             <p className="text-lg text-center text-gray-600 mb-6">You scored {score} out of {totalQuestions}!</p>
             <div className="text-center mb-8">
                <Button onClick={restartQuiz}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
             </div>
             <div className="space-y-4">
                {questions.map((q: any, index: number) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === q.correctAnswer;
                    return (
                        <div key={index} className="p-4 border rounded-lg bg-white shadow-sm">
                            <p className="font-semibold">{index + 1}. {q.question}</p>
                            <p className={`mt-2 text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>Your Answer: {userAnswer || "Not Answered"}</p>
                            {!isCorrect && <p className="text-sm text-green-700">Correct Answer: {q.correctAnswer}</p>}
                            <p className="text-xs text-gray-500 mt-2">{q.explanation}</p>
                        </div>
                    )
                })}
             </div>
        </div>
    )
  }

  const current = questions[currentIndex];

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
          {current.options.map((opt: string, index: number) => {
            const isSelected = answers[currentIndex] === opt;
            return (
              <button
                key={index}
                onClick={() => handleSelectOption(currentIndex, opt)}
                className={`p-4 rounded-lg border text-left transition-colors duration-200 text-base ${
                    isSelected
                    ? "bg-purple-600 text-white border-purple-700 shadow-md"
                    : "bg-white hover:bg-purple-50 border-gray-300"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <Button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} disabled={currentIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        {currentIndex === totalQuestions - 1 ? (
             <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <CheckCheck className="mr-2 h-4 w-4" /> Submit Quiz
            </Button>
        ) : (
            <Button onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))} disabled={currentIndex === totalQuestions - 1}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        )}
      </div>

    </div>
  );
}
