"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Monitor, BookOpen } from "lucide-react";

export default function MockTestInstructionPage() {
  const params = useParams();
  const testId = params.id as string;

  function startTest() {
    // OPTIONAL fullscreen — SAFE (user click)
    try {
      document.documentElement.requestFullscreen?.();
    } catch {}

    window.location.href = `/dashboard/mock-test/${testId}`;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Mock Test Instructions
      </h1>

      {/* INSTRUCTIONS */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <Instruction
          icon={<Clock />}
          title="Test Duration"
          text="The test is time-bound. The timer will start immediately once you begin the test."
        />

        <Instruction
          icon={<BookOpen />}
          title="Question Pattern"
          text="Each question carries equal marks. Some questions have negative marking for incorrect answers."
        />

        <Instruction
          icon={<Monitor />}
          title="Navigation"
          text="You can move between questions using Next and Previous buttons. Answers can be changed before submission."
        />

        <Instruction
          icon={<AlertTriangle />}
          title="Auto Submission"
          text="The test will be automatically submitted when the timer reaches zero."
        />
      </div>

      {/* WARNINGS */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-amber-800 text-lg">
          Important Warnings
        </h2>

        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
          <li>Do not refresh the page during the test.</li>
          <li>Do not close the browser until submission.</li>
          <li>Test progress is not saved if the page is reloaded.</li>
          <li>This is a practice mock test for self-assessment.</li>
        </ul>
      </div>

      {/* ACTION */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="px-10"
          onClick={startTest}
        >
          Start Mock Test
        </Button>
      </div>
    </div>
  );
}

function Instruction({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-primary mt-1">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-600">{text}</div>
      </div>
    </div>
  );
}
