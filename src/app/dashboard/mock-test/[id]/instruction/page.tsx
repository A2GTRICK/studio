
"use client";

import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Monitor, 
  BookOpen, 
  Loader2, 
  Crown, 
  ShieldCheck, 
  Sparkles, 
  IndianRupee, 
  ChevronLeft, 
  CheckCircle2, 
  Lock 
} from "lucide-react";
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db, auth as firebaseAuth } from '@/firebase/config';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


/* -------------------------------------------------
   HELPERS
-------------------------------------------------- */

function daysBetween(date?: string | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function hasActivePremium(userData: any) {
  if (!userData) return false;
  if (userData.isLifetime) return true;
  const days = daysBetween(userData?.premiumUntil);
  return days !== null && days >= 0;
}

/* -------------------------------------------------
   PAGE COMPONENT
-------------------------------------------------- */

export default function MockTestInstructionPage() {
  const router = useRouter();
  const { id: testId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuthSession();
  const { toast } = useToast();

  const [test, setTest] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (!testId || authLoading) return;

    async function loadData() {
      setLoading(true);
      try {
        const testRef = doc(db, 'test_series', testId);
        const testSnap = await getDoc(testRef);
        
        if (testSnap.exists()) {
          setTest(testSnap.data());
        } else {
          setTest(null); 
        }

        if (user?.uid) {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUserData(userSnap.data());
            }
        }
      } catch (e) {
        console.error("Failed to load data", e);
        toast({
            variant: "destructive",
            title: "Error Loading Test",
            description: "Could not load test data. Please try again."
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [testId, user, authLoading, toast]);


  const handleSinglePurchase = async () => {
    if (!testId || !test?.price || !user) return;
    if (!user.emailVerified) {
        toast({
            variant: "destructive",
            title: "Email verification required",
            description: "Please verify your email before purchasing.",
        });
        return;
    }
    setIsProcessing(true);
    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: test.price, plan: "single_test", contentId: testId }),
      });
      const order = await orderRes.json();

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "pharmA2G",
        description: test.title,
        order_id: order.id,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              userId: user.uid,
              plan: "single_test",
              contentId: testId,
              amount: order.amount,
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            toast({ title: "Access granted", description: "You can now start the test." });
            window.location.reload();
          } else {
            throw new Error("Payment verification failed");
          }
        },
        prefill: { name: user.displayName || "", email: user.email || "" },
        theme: { color: "#4F46E5" },
      });
      razorpay.open();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Payment failed", description: err.message || "Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartTest = () => {
    if (!user) {
        router.push(`/auth/login?redirect=/dashboard/mock-test/${testId}/instruction`);
        return;
    }
    sessionStorage.setItem(`mocktest_${testId}_accepted`, "true");
    router.push(`/dashboard/mock-test/${testId}`);
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col gap-4 items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
        <p className="text-sm text-slate-500 animate-pulse font-medium">Preparing secure environment...</p>
      </div>
    );
  }

  if (!test) {
      return (
          <div className="min-h-screen flex items-center justify-center text-center">
              <div>
                <h2 className="text-2xl font-bold">Test Not Found</h2>
                <p className="text-muted-foreground mt-2">The test you are looking for does not exist or has been moved.</p>
                <Button onClick={() => router.push('/dashboard/mock-test/vault')} className="mt-6">Back to Test Vault</Button>
              </div>
          </div>
      )
  }

  const isPremiumTest = test?.isPremium === true;
  const hasGrant = userData?.grantedTestIds?.includes(testId);
  const isPro = hasActivePremium(userData);
  const canAccess = !isPremiumTest || isPro || hasGrant;

  /* ---------------- PREMIUM LOCK UI ---------------- */
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 font-sans">
        <div className="max-w-xl mx-auto space-y-6">
          <button onClick={() => router.back()} className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </button>

          <div className="bg-white border border-slate-200 shadow-xl rounded-[2rem] overflow-hidden transition-all">
            <div className="p-8 md:p-12 text-center space-y-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-200 blur-3xl rounded-full opacity-40 animate-pulse"></div>
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-2xl rotate-3">
                    <Crown className="text-white w-12 h-12" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Unlock Premium Access</h1>
                <p className="text-slate-500 text-lg leading-relaxed px-4">
                  Experience the full potential of <span className="font-bold text-slate-900 italic">"{test?.title}"</span> with our pro-grade testing tools.
                </p>
              </div>

              <div className="grid grid-cols-1 text-left gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <FeatureItem text="NTA Standard CBT interface simulation" />
                <FeatureItem text="Deep-dive performance & peer analytics" />
                <FeatureItem text="Detailed explanations for every question" />
              </div>

              <div className="pt-4 space-y-4">
                {test?.price > 0 && (
                  <button
                    onClick={handleSinglePurchase}
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 fill-white/20" />
                        Buy This Test • <IndianRupee className="h-4 w-4" />{test.price}
                      </>
                    )}
                  </button>
                )}

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">
                    <span className="bg-white px-4">Recommendation</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push('/dashboard/billing')}
                  className="w-full border-2 border-indigo-600 text-indigo-600 font-bold py-4 rounded-2xl hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  Get Unlimited Pro Access
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-400 pt-4">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                SECURE CHECKOUT BY RAZORPAY
              </div>
            </div>
          </div>
          
          <div className="text-center">
             <button onClick={() => router.push('/dashboard/mock-test/vault')} className="text-sm font-medium text-slate-500 hover:text-indigo-600 underline underline-offset-4">
              View available free mock tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- INSTRUCTIONS UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest border border-indigo-200">
            System Ready • Secure Session
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            {test?.title}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Review your test configuration and examination rules before proceeding to the digital interface.
          </p>
        </div>

        <div className="bg-white border border-slate-200 shadow-2xl rounded-[2.5rem] p-8 md:p-12 space-y-10 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <BookOpen className="w-64 h-64 -rotate-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <Instruction 
              icon={<Clock />} 
              title="Time Duration" 
              text={`${test?.duration || 60} minutes`}
              subtext="The countdown is synchronized with our server."
            />
            <Instruction 
              icon={<BookOpen />} 
              title="Assessment" 
              text={`${test?.questionCount || 0} Objective Questions`}
              subtext="Multiple choice format with negative marking."
            />
            <Instruction 
              icon={<Monitor />} 
              title="CBT Navigation" 
              text="Standard Exam Interface"
              subtext="Flag questions for review and navigate freely."
            />
            <Instruction 
              icon={<AlertTriangle />} 
              title="System Integrity" 
              text="Automatic Submission"
              subtext="Auto-saves progress. Submits when time expires."
            />
          </div>

          <div className="pt-8 border-t border-slate-100">
             <div className="bg-amber-50 rounded-2xl p-6 flex gap-4 items-start border border-amber-100 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-900 text-sm">Agreement & Confirmation</h4>
                  <p className="text-sm text-amber-800/80 leading-relaxed font-medium">
                    By entering the examination, you agree to abide by the system rules. Ensure your device is connected to a power source. You cannot pause the examination once it has started.
                  </p>
                </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            <button 
              onClick={() => router.back()}
              className="px-10 py-4 font-bold text-slate-500 hover:text-slate-800 transition-colors order-2 sm:order-1"
            >
              Cancel & Exit
            </button>
            <button 
              onClick={handleStartTest}
              className="px-12 py-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:translate-y-[-2px] active:translate-y-[0] order-1 sm:order-2"
            >
              I Agree & Begin Examination
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
           <span className="flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> End-to-End Encrypted</span>
           <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Identity Verified</span>
           <span className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" /> ISO 27001 Certified</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- HELPER COMPONENTS ---------------- */

function FeatureItem({ text }: {text: string}) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
      {text}
    </div>
  );
}

function Instruction({ icon, title, text, subtext }: {icon: React.ReactNode, title: string, text: string, subtext: string}) {
  return (
    <div className="flex gap-5 group">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all duration-300">
        {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">{title}</h3>
        <p className="text-xl font-bold text-slate-900">{text}</p>
        <p className="text-sm text-slate-400 font-medium leading-relaxed">{subtext}</p>
      </div>
    </div>
  );
}
