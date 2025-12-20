 "use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
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

  // ✅ If not premium OR user has access → render content
  if (!isPremium || canAccess) {
    return <>{children}</>;
  }

  // 🔒 Soft, trust-based lock UI
  return (
    <div className="mt-10">
      <div className="max-w-xl mx-auto border border-dashed rounded-2xl p-8 bg-white text-center shadow-sm">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-purple-700" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900">
          Part of Structured Study Material
        </h2>

        {/* Description */}
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">
          This {contentType} is included in our carefully structured,
          syllabus-based study material designed for complete and
          distraction-free exam preparation.
        </p>

        {/* Support line */}
        <p className="mt-2 text-gray-500 text-sm">
          Students with Pro access get uninterrupted access to all related
          notes, mock tests, and practice material for this subject.
        </p>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            onClick={() => router.push("/dashboard/upgrade")}
            className="px-6"
          >
            Continue with Pro Access
          </Button>

          {/* Optional soft secondary action */}
          <button
            onClick={() => router.back()}
            className="text-sm text-purple-600 hover:underline"
          >
            Explore free content
          </button>
        </div>
      </div>
    </div>
  );
}
