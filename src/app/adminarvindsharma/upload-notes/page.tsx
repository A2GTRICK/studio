"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Loader2, Save, UploadCloud, CheckCircle } from "lucide-react";

export default function UploadNotesPage() {
  const router = useRouter();
  const db = useFirestore();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = sessionStorage.getItem("A2G_ADMIN");
    if (s !== "ACTIVE") router.push("/adminarvindsharma");
  }, [router]);

  const handleSubmit = async () => {
    if (!db) {
      setStatus({ type: 'error', message: "Firestore is not available." });
      return;
    }
    setStatus(null);
    setLoading(true);
    const adminKey = sessionStorage.getItem("A2G_ADMIN_KEY") || "";
    if (!adminKey) {
      setStatus({ type: 'error', message: "Missing admin key in session. Re-verify." });
      setLoading(false);
      return;
    }
    if (!title || !subject || !content) {
      setStatus({ type: 'error', message: "Title, Subject, and Content are required." });
      setLoading(false);
      return;
    }

    const notesCollection = collection(db, "notes");
    const noteData = {
      title,
      course,
      year,
      subject,
      content,
      isPremium: !!isPremium,
      createdAt: serverTimestamp(),
      adminKey, // important: used by Firestore rules to validate write
    };

    addDoc(notesCollection, noteData)
      .then(() => {
        setStatus({ type: 'success', message: "Note saved successfully!" });
        setTitle("");
        setCourse("");
        setYear("");
        setSubject("");
        setContent("");
        setIsPremium(false);
      })
      .catch(async (serverError) => {
        setStatus({ type: 'error', message: "Upload failed. Check permissions and Firestore rules." });
        const permissionError = new FirestorePermissionError({
          path: notesCollection.path,
          operation: 'create',
          requestResourceData: noteData,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(serverError);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <UploadCloud className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl font-bold">Upload Note</CardTitle>
                        <CardDescription>Add a new study note to the library.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="e.g., Introduction to Pharmacology" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="e.g., Pharmacology" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="course">Course</Label>
                        <Input id="course" placeholder="e.g., B.Pharm" value={course} onChange={(e) => setCourse(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input id="year" placeholder="e.g., 2nd Year" value={year} onChange={(e) => setYear(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Full Content</Label>
                    <Textarea
                        id="content"
                        className="min-h-[250px] font-mono text-sm"
                        placeholder="Enter the full note content here. HTML and Markdown are supported."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="isPremium" checked={isPremium} onCheckedChange={(checked) => setIsPremium(Boolean(checked))} />
                    <Label htmlFor="isPremium" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mark as Premium Content
                    </Label>
                </div>
                
                {status && (
                    <Alert variant={status.type === 'error' ? 'destructive' : 'default'} className={status.type === 'success' ? 'bg-green-50 border-green-300' : ''}>
                        {status.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        <AlertTitle>{status.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                        <AlertDescription>
                            {status.message}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Note
                            </>
                        )}
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/adminarvindsharma/dashboard")} className="w-full sm:w-auto">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
