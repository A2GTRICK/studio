
"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import {
  addDoc,
  deleteDoc,
  doc,
  collection,
  orderBy,
  onSnapshot,
  serverTimestamp,
  query,
  Timestamp
} from "firebase/firestore";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useRouter } from "next/navigation";

interface CustomNotification {
  id: string;
  title: string;
  summary: string;
  category: string;
  link?: string;
  createdAt: Date;
}

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);

  useEffect(() => {
    // Admin Guard
    const s = sessionStorage.getItem("A2G_ADMIN");
    if (s !== "ACTIVE") {
        router.push("/adminarvindsharma");
        return;
    }

    if (!db) {
        toast({ title: "Error", description: "Firestore not initialized." });
        setLoading(false);
        return;
    }

    const q = query(collection(db, "custom_notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            summary: data.summary,
            category: data.category,
            link: data.link,
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        };
      });
      setNotifications(list);
      setLoading(false);
    },
    (err) => {
        console.error(err);
        const permissionError = new FirestorePermissionError({
            path: 'custom_notifications',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsub();
  }, [router, toast]);

  const createNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) {
        toast({ title: "Error", description: "Firestore not initialized."});
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const notificationData = {
        title: formData.get("title") as string,
        summary: formData.get("summary") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        createdAt: serverTimestamp(),
    };

    if (!notificationData.title || !notificationData.summary || !notificationData.category) {
      toast({
        title: "Missing Fields",
        description: "Title, Summary & Category are required.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    const notificationCollection = collection(db, "custom_notifications");
    addDoc(notificationCollection, notificationData)
    .then(() => {
        toast({ title: "Success", description: `Published: ${notificationData.title}` });
        e.currentTarget.reset();
    })
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: notificationCollection.path,
            operation: 'create',
            requestResourceData: notificationData
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsSubmitting(false);
    });
  };

  const deleteNotification = async (id: string) => {
    if (!db) {
        toast({ title: "Error", description: "Firestore not initialized."});
        return;
    }
    const noteDoc = doc(db, "custom_notifications", id);
    deleteDoc(noteDoc)
    .then(() => {
        toast({
            title: "Deleted",
            description: "Notification removed."
        });
    })
    .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: noteDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
      {/* CREATE FORM */}
      <div className="lg:col-span-1">
        <Card>
            <form onSubmit={createNotification}>
            <CardHeader>
                <CardTitle>Create Notification</CardTitle>
                <CardDescription>Publish an announcement.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="e.g., GPAT Exam Dates Announced" required />
                </div>
                <div>
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea id="summary" name="summary" placeholder="Summary" required />
                </div>

                <div>
                    <Label>Category</Label>
                    <Select name="category" required>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Exam Alert">Exam Alert</SelectItem>
                        <SelectItem value="Job Notification">Job Notification</SelectItem>
                        <SelectItem value="University Update">University Update</SelectItem>
                        <SelectItem value="Content Update">Content Update</SelectItem>
                        <SelectItem value="PCI Circular">PCI Circular</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="link">External Link (optional)</Label>
                    <Input id="link" name="link" placeholder="Optional link..." />
                </div>
            </CardContent>

            <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Publishing..." : "Publish Notification"}
                </Button>
            </CardFooter>
            </form>
        </Card>
      </div>

      {/* LIST */}
       <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Published Notifications</CardTitle>
            <CardDescription>Latest announcements appear first.</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {notifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>{n.title}</TableCell>
                      <TableCell>{n.category}</TableCell>
                      <TableCell>{format(n.createdAt, "PPP")}</TableCell>

                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action can't be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteNotification(n.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
