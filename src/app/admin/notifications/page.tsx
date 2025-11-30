"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2, PlusCircle, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";

interface Notification {
    id: string;
    title: string;
    summary: string;
    category: string;
    link?: string;
    createdAt: Timestamp;
}

export default function AdminNotificationPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  // Fetch notifications from server
  async function load() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Cannot load notifications", variant: "destructive" });
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Submit new notification
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      summary: form.get("summary"),
      category: form.get("category"),
      link: form.get("link"),
    };

    try {
      await fetch("/api/notifications/create", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
      });

      toast({ title: "Success", description: "Notification published!" });
      e.currentTarget.reset();
      load(); // refresh table
    } catch (err) {
      toast({ title: "Error", description: "Failed to create notification", variant: "destructive" });
    }

    setFormLoading(false);
  }

  // Delete notification
  async function handleDelete(id: string) {
    try {
      await fetch("/api/notifications/delete?id=" + id, { method: "DELETE" });
      toast({ title: "Deleted", description: "Notification removed" });
      load();
    } catch (err) {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 mt-6 gap-6">
      
      {/* LEFT SIDE — CREATE FORM */}
      <Card className="md:col-span-1 shadow-lg border">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Publish Notification</CardTitle>
          <CardDescription>Create updates for all students.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="e.g., GPAT 2025 Updates" required />
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" placeholder="Short description…" required />
            </div>

            <div>
              <Label>Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
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
              <Input id="link" name="link" placeholder="https://source.com/" />
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full" disabled={formLoading}>
              {formLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <PlusCircle className="h-4 w-4 mr-2" />
              )}
              {formLoading ? "Publishing…" : "Publish"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* RIGHT SIDE — TABLE */}
      <Card className="md:col-span-2 shadow-xl border">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Published Notifications</CardTitle>
          <CardDescription>Newest updates appear first.</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No notifications published yet.</p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 flex justify-between items-start">
                  
                  <div>
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.summary}</div>

                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">{n.category}</span>

                      <span>
                        {n.createdAt?.toDate
                          ? new Date(n.createdAt.seconds * 1000).toLocaleDateString("en-IN")
                          : ""}
                      </span>
                    </div>

                    {n.link && (
                      <Link
                        href={n.link}
                        target="_blank"
                        className="text-blue-600 text-xs flex items-center gap-1 mt-2"
                      >
                        Open Source <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(n.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}