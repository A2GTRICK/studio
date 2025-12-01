
'use client';

import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminBlogPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const ref = collection(db, "posts");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Error fetching posts:", error);
      toast({ title: "Error", description: "Could not fetch posts.", variant: "destructive" });
    });
    return () => unsub();
  }, [toast]);

  const createPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const postData = {
      title: formData.get("title"),
      summary: formData.get("summary"),
      content: formData.get("content"),
      category: formData.get("category"),
      banner: formData.get("banner"),
      adminKey: formData.get("adminKey"),
      createdAt: serverTimestamp(),
    };

    if (!postData.title || !postData.summary || !postData.content || !postData.adminKey) {
        toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    const postsCollection = collection(db, "posts");
    try {
      await addDoc(postsCollection, postData);
      toast({ title: "Success!", description: "Post published." });
      (e.target as HTMLFormElement).reset();
    } catch (serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: postsCollection.path,
            operation: 'create',
            requestResourceData: postData,
        });
        errorEmitter.emit('permission-error', permissionError);
    }
    setIsLoading(false);
  };

  const deletePost = async (id: string) => {
    const postDoc = doc(db, "posts", id);
    try {
        await deleteDoc(postDoc);
        toast({ title: "Deleted", description: "Post has been removed."});
    } catch(serverError: any) {
        const permissionError = new FirestorePermissionError({
            path: postDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
      
      {/* CREATE POST */}
      <Card>
        <CardHeader>
          <CardTitle>Create Blog Post</CardTitle>
          <CardDescription>Publish new article to your blog.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={createPost} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" required />
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea name="summary" required />
            </div>

            <div className="space-y-2">
              <Label>Banner Image URL</Label>
              <Input name="banner" placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input name="category" placeholder="Pharmacology, News, Careers..." />
            </div>

            <div className="space-y-2">
              <Label>Full Article Content</Label>
              <Textarea name="content" rows={10} required />
            </div>

            <div className="space-y-2">
              <Label>Admin Key</Label>
              <Input name="adminKey" type="password" required />
            </div>

            <Button disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Publish Article
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* POSTS LIST */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Published Posts</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {posts.length === 0 && (
              <p className="text-muted-foreground">No posts yet.</p>
            )}

            {posts.map((p) => (
              <div key={p.id} className="border p-4 rounded-lg flex justify-between">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.category}</p>
                </div>

                <Button variant="destructive" size="icon" onClick={() => deletePost(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
