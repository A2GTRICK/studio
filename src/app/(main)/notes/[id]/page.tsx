
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Gem, AlertTriangle, ShoppingCart, ArrowRight, Check, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentDialog } from '@/components/payment-dialog';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { publicAssets } from '@/lib/public-assets';

export type Note = {
  id: string;
  title: string;
  course: string;
  year: string;
  subject: string;
  isPremium: boolean;
  preview: string;
  createdAt: any;
};


const premiumFeatures = [
    "Access to ALL detailed library notes",
    "AI Note & Exam Question Generation",
    "Ask follow-up questions to our AI Tutor",
    "In-depth competitive exam preparation",
];

export default function NoteDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchNote = async () => {
        setIsLoading(true);
        const docRef = doc(db, "notes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setNote({ ...docSnap.data(), id: docSnap.id } as Note);
        } else {
            setNote(null); // Will trigger notFound()
        }
        setIsLoading(false);
    }
    fetchNote();
  }, [id]);


  if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )
  }

  if (!note) {
    notFound();
  }

  const handleBuyNow = () => {
    setShowUnlockDialog(false);
    setShowPaymentDialog(true);
  }

  // A user could still try to access a premium note directly via URL
  if (note.isPremium) {
    return (
        <>
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="p-4 rounded-full bg-destructive/10 mb-4">
                <Lock className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-headline font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2">This is a premium note. Please upgrade your plan or purchase it individually to view this content.</p>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button onClick={() => setShowUnlockDialog(true)} size="lg">
                    <Gem className="mr-2 h-4 w-4"/>
                    Unlock This Note
                </Button>
                <Button asChild variant="ghost" size="lg">
                     <Link href="/notes">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back to Library
                    </Link>
                </Button>
            </div>
        </div>

        <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                     <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        <Gem className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center font-headline text-2xl">Unlock "{note?.title}"</DialogTitle>
                    <DialogDescription className="text-center text-base">
                       Choose how you want to access this premium note.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="font-semibold mb-3">Premium benefits include:</p>
                    <ul className="space-y-3">
                        {premiumFeatures.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col gap-2">
                    <Button asChild size="lg">
                        <Link href="/premium">Upgrade to Premium <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleBuyNow}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Just This Note for INR 19
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
        
        <PaymentDialog 
            isOpen={showPaymentDialog} 
            setIsOpen={setShowPaymentDialog}
            title={`Buy "${note?.title}"`}
            price="INR 19"
             onPaymentSuccess={() => {
                setShowPaymentDialog(false);
                setShowUnlockDialog(false);
            }}
        />
        </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/notes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Notes Library
            </Link>
        </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-3xl">{note.title}</CardTitle>
              <CardDescription>Course: {note.course} | Year: {note.year} | Subject: {note.subject}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          {/* 
            This is where your actual note content would go. 
            In a real app, you would fetch this from a database (like Firestore) 
            or a markdown file. For this prototype, we're using placeholder text.
          */}
          <h2>Introduction to {note.title}</h2>
          <p>
            {note.preview}
          </p>
          <p>
            This section provides a detailed overview of the fundamental concepts related to {note.title}. We will explore the core principles, historical context, and its significance in modern pharmacy practice. For students in the {note.course} program, understanding these basics is crucial for building a strong foundation in {note.subject}.
          </p>
         
          <h3>Key Concepts</h3>
          <ul>
            <li><strong>Concept A:</strong> Placeholder text explaining the first key concept. This would be replaced with actual content from your notes.</li>
            <li><strong>Concept B:</strong> Placeholder text explaining the second key concept. This content needs to be detailed and accurate.</li>
            <li><strong>Concept C:</strong> Placeholder text explaining the third key concept. This is where you would elaborate on important definitions and mechanisms.</li>
          </ul>

          <h3>Detailed Explanation (Placeholder)</h3>
          <p>
            Here, the note would dive deeper into the specifics. For example, in Pharmaceutical Analysis, this section might cover the principles of titration, the types of indicators used, and the mathematical formulas for calculation. Each point would be explained with clarity, supported by diagrams or examples where necessary. 
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed ante et nisi maximus commodo. Curabitur vel sem vel velit auctor blandit. Vivamus nec quam nec libero consectetur commodo. Nullam ac urna eu felis dapibus condimentum.
          </p>

          <blockquote>
            This is a blockquote for highlighting important information, definitions, or clinical pearls. It helps draw the student's attention to critical points.
          </blockquote>

          <h3>Conclusion</h3>
          <p>
            This placeholder concludes the note on {note.title}. A real note would summarize the key takeaways and might include review questions or a brief look at future trends in the field.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
