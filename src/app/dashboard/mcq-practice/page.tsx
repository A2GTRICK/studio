"use client";
import { useState } from "react";

export default function MCQPractice() {
  const [subject, setSubject] = useState("");
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Temporary MCQs (Later replaced with AI or Firestore)
  const mcqs = [
    {
      question: "Which organ is responsible for insulin secretion?",
      options: ["Liver", "Pancreas", "Kidney", "Stomach"],
      answer: "Pancreas",
    },
    {
      question: "What is the pH of blood?",
      options: ["6.8", "7.4", "5.5", "8.0"],
      answer: "7.4",
    },
    {
      question: "Which vitamin is also known as Ascorbic Acid?",
      options: ["Vitamin D", "Vitamin C", "Vitamin A", "Vitamin K"],
      answer: "Vitamin C",
    },
  ];

  const startPractice = () => {
    if (!subject) return;
    setStarted(true);
  };

  const checkAnswer = () => {
    if (selectedOption === mcqs[currentQ].answer) {
      setScore(score + 1);
    }
    if (currentQ + 1 < mcqs.length) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">MCQ Practice</h1>
      <p className="text-gray-600">Practice important questions and improve your exam performance.</p>

      {!started && (
        <div className="max-w-md space-y-4">
          <select
            className="p-3 border rounded w-full"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            <option value="Pharmacognosy">Pharmacognosy</option>
            <option value="Pharmaceutics">Pharmaceutics</option>
            <option value="Pharmacology">Pharmacology</option>
            <option value="Pharmaceutical Chemistry">Pharmaceutical Chemistry</option>
          </select>

          <button
            onClick={startPractice}
            className="p-3 bg-blue-600 text-white rounded w-full"
          >
            Start Practice
          </button>
        </div>
      )}

      {started && !showResult && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Question {currentQ + 1}/{mcqs.length}
          </h2>

          <div className="p-4 bg-white border rounded shadow-sm">
            <p className="font-medium mb-4">{mcqs[currentQ].question}</p>

            <div className="space-y-2">
              {mcqs[currentQ].options.map((opt, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mcq"
                    value={opt}
                    checked={selectedOption === opt}
                    onChange={() => setSelectedOption(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={checkAnswer}
            className="p-3 bg-green-600 text-white rounded"
            disabled={!selectedOption}
          >
            Next
          </button>
        </div>
      )}

      {showResult && (
        <div className="p-6 bg-white border rounded shadow-sm">
          <h2 className="text-xl font-bold mb-4">Your Result</h2>
          <p className="text-gray-700 text-lg">
            Score: {score} / {mcqs.length}
          </p>

          <button
            className="mt-4 p-3 bg-blue-600 text-white rounded"
            onClick={() => {
              setShowResult(false);
              setStarted(false);
              setCurrentQ(0);
              setScore(0);
              setSelectedOption(null);
            }}
          >
            Practice Again
          </button>
        </div>
      )}
    </div>
  );
}
