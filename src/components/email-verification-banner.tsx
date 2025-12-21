
"use client";

import { useState, useEffect } from "react";
import { sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { MailCheck, X, CheckCircle2 } from "lucide-react";

export default function EmailVerificationBanner() {
  const authSession = useAuthSession();
  const user = authSession?.user;

  const [hidden, setHidden] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.emailVerified) return;

    const dismissed = sessionStorage.getItem("email_verify_dismissed");
    if (!dismissed) {
      setHidden(false);
    }
  }, [user]);

  if (!user || user.emailVerified || hidden) return null;

  async function handleResend() {
    if (!user) return;
    setSending(true);
    try {
      await sendEmailVerification(user);
      setSent(true);
    } catch (err) {
      console.error("Verification email failed", err);
    } finally {
      setSending(false);
    }
  }

  function dismiss() {
    sessionStorage.setItem("email_verify_dismissed", "true");
    setHidden(true);
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
      <div className="flex items-start gap-3 flex-1">
        <MailCheck className="w-6 h-6 text-amber-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-900">
            Verify your email address
          </h3>
          <p className="text-sm text-amber-800 mt-1">
            Secure your account and receive important exam alerts, results, and notifications without interruption.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end">
        <div className="flex items-center gap-2">
            <Button
            size="sm"
            onClick={handleResend}
            disabled={sending || sent}
            >
            {sent ? "Email Sent" : sending ? "Sending..." : "Verify Now"}
            </Button>

            <Button
            size="sm"
            variant="ghost"
            onClick={dismiss}
            >
            <X className="w-4 h-4" />
            </Button>
        </div>
        {sent && (
            <div className="flex items-center gap-2 text-green-700 text-sm mt-2">
                <CheckCircle2 className="w-4 h-4" />
                Verification email sent. Please check your inbox.
            </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">
            After verifying, refresh this page to see your verified status.
        </p>
      </div>
    </div>
  );
}
