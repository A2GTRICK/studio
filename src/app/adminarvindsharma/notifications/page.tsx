'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

import { format } from 'date-fns';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);

  // 📌 FETCH NOTIFICATIONS LIVE
  useEffect(() => {
    const q = query(
      collection(db, 'custom_notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
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
        console.error("Notification fetch error:", err);
        toast({
          title: "Error",
          description: "Failed to fetch notifications.",
          variant: "destructive"
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 📌 ADD NEW NOTIFICATION
  const handleAdd = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const category = formData.get("category") as string;
    const link = formData.get("link") as string;

    if (!title || !summary || !category) {
      toast({
        title: "Missing Fields",
        description: "Title, Summary & Category are required.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    await addDoc(collection(db, "custom_notifications"), {
      title,
      summary,
      category,
      link,
      createdAt: serverTimestamp(),
      adminKey: "Arvind8826@" // REQUIRED
    });

    toast({ title: "Success", description: `Published: ${title}` });

    e.target.reset();
    setIsSubmitting(false);
  };

  // 📌 DELETE NOTIFICATION
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'custom_notifications', id));
    toast({
      title: "Deleted",
      description: "Notification removed."
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">

      {/* CREATE FORM */}
      <div className="lg:col-span-1">
        <Card>
          <form onSubmit={handleAdd}>
            <CardHeader>
              <CardTitle>Create Notification</CardTitle>
              <CardDescription>Publish updates for all students.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input name="title" placeholder="e.g., GPAT Exam Dates Announced" required />
              </div>

              <div>
                <Label>Summary</Label>
                <Textarea name="summary" required />
              </div>

              <div>
                <Label>Category</Label>
                <Select name="category" required>
                  <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
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
                <Label>External Link (optional)</Label>
                <Input name="link" placeholder="https://example.com" />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Publishing..." : "Publish Notification"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* NOTIFICATIONS TABLE */}
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
                                onClick={() => handleDelete(n.id)}
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
