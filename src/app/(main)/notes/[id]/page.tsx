
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Gem, AlertTriangle, ShoppingCart, ArrowRight, Check, Lock, Loader2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentDialog } from '@/components/payment-dialog';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { marked } from 'marked';

export type Note = {
  id: string;
  title: string;
  course: string;
  year: string;
  subject: string;
  isPremium: boolean;
  content: string;
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
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchNote = async () => {
        setIsLoading(true);
        const docRef = doc(db, "notes", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const noteData = { ...docSnap.data(), id: docSnap.id } as Note;
            setNote(noteData);
            if(noteData.content){
                if (noteData.content.startsWith('https://docs.google.com')) {
                    const gdriveContent = `
<div class="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
    <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-200 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-blue-700"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m10.4 17.5 3.1-3.1-3.1-3.1"></path></svg>
        </div>
        <h3 class="text-lg font-semibold text-blue-800">Note Content from Google Drive</h3>
    </div>
    <p class="mt-3 text-blue-700">This note's content is stored in a Google Drive document. Click the button below to open it in a new tab.</p>
    <a href="${noteData.content}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
        Open Google Drive Document
    </a>
</div>
                    `;
                    setHtmlContent(gdriveContent);
                } else if (noteData.content.includes('Note Content from Uploaded File')) {
                     const fileContent = marked.parse(noteData.content);
                     setHtmlContent(fileContent);
                } else {
                    const content = await marked.parse(noteData.content);
                    setHtmlContent(content);
                }
            }
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
        <CardContent className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </Card>
    </div>
  );
}
