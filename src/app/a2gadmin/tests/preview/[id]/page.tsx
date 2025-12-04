"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TestPreviewPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);

  // -------------------------
  // LOAD TEST DATA
  // -------------------------
  async function loadTest() {
    try {
      const res = await fetch("/api/a2gadmin/tests");
      const data = await res.json();

      const found = data.tests.find((t: any) => t.id === id);
      if (!found) {
        setTest(null);
      } else {
        setTest(found);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to load test:", err);
    }
  }

  useEffect(() => {
    if (id) loadTest();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!test) return <div className="p-10 text-center text-red-500">Test not found</div>;

  const { title, course, subject, year, description, difficulty, questions } = test;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Link
          href={`/a2gadmin/tests/edit/${id}`}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Edit Test
        </Link>
      </div>

      {/* META INFO */}
      <div className="p-4 border rounded-lg bg-purple-50 space-y-2">
        <p><strong>Course:</strong> {course}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Year:</strong> {year}</p>
        <p><strong>Difficulty:</strong> {difficulty}</p>
        {description && <p><strong>Description:</strong> {description}</p>}
        <p className="pt-2 text-purple-700 font-semibold">
          Total Questions: {questions?.length || 0}
        </p>
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-6">
        {questions?.map((q: any, index: number) => (
          <div
            key={index}
            className="p-6 border rounded-xl bg-white shadow-md space-y-4"
          >
            <h3 className="font-semibold text-lg">
              {index + 1}. {q.question}
            </h3>

            <div className="space-y-2">
              {["A", "B", "C", "D"].map((opt) => {
                const value = q[`option${opt}`];
                const isCorrect = q.answer === opt;

                return (
                  <div
                    key={opt}
                    className={`p-3 border rounded-lg ${
                      isCorrect
                        ? "bg-green-100 border-green-500 font-semibold"
                        : "bg-gray-50"
                    }`}
                  >
                    <span className="text-purple-700 font-bold mr-2">{opt}.</span>
                    {value}
                  </div>
                );
              })}
            </div>

            <p className="text-green-700 font-bold">
              Correct Answer: {q.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
