"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Lock, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

type PremiumGuardProps = {
  isPremium: boolean;
  canAccess: boolean;
  contentType?: "note" | "test" | "mcq";
  children: ReactNode;
};

export default function PremiumGuard({
  isPremium,
  canAccess,
  contentType = "content",
  children,
}: PremiumGuardProps) {
  const router = useRouter();

  // ✅ Allow access
  if (!isPremium || canAccess) {
    return <>{children}</>;
  }

  return (
    <div className="mt-14">
      <div className="max-w-2xl mx-auto rounded-3xl border border-dashed bg-white px-10 py-12 shadow-sm text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
            <Lock className="h-7 w-7 text-purple-700" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">
          Part of Structured Study Material
        </h2>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
          This {contentType} is included in our carefully structured,
          syllabus-based study material designed to support complete and
          distraction-free exam preparation.
        </p>

        {/* Support Line */}
        <p className="text-sm text-gray-500">
          Pro access helps students maintain continuity across notes, mock
          tests, and practice material for this subject.
        </p>

        {/* CTA */}
        <div className="pt-2">
          <Button
            onClick={() => router.push("/dashboard/billing")}
            className="px-8 py-6 text-base rounded-xl"
          >
            Continue with Pro Access
          </Button>

          <div className="mt-3">
            <button
              onClick={() => router.back()}
              className="text-sm text-purple-600 hover:underline"
            >
              Explore free content
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t pt-6" />

        {/* Suggested Content */}
        <div className="text-left space-y-3">
          <div className="flex items-center gap-2 text-purple-700 font-semibold">
            <BookOpen className="w-4 h-4" />
            Suggested for you
          </div>

          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Free overview notes from the same subject</li>
            <li>• Important exam-oriented summaries</li>
            <li>• Practice MCQs available without Pro</li>
          </ul>

          <button
            onClick={() => router.push("/dashboard/notes")}
            className="mt-2 text-sm text-purple-600 hover:underline"
          >
            Browse free notes →
          </button>
        </div>
      </div>
    </div>
  );
}
