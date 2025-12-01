
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
    const data = {
      title: formData.get("title"),
      summary: formData.get("summary"),
      content: formData.get("content"),
      category: formData.get("category"),
      banner: formData.get("banner"),
      adminKey: formData.get("adminKey"),
      createdAt: serverTimestamp(),
    };

    if (!data.title || !data.summary || !data.content || !data.adminKey) {
        toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive"});
        setIsLoading(false);
        return;
    }

    try {
      await addDoc(collection(db, "posts"), data);
      toast({ title: "Success!", description: "Post published." });
      (e.target as HTMLFormElement).reset();
    } catch (e: any) {
      console.error("Create post error", e);
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setIsLoading(false);
  };

  const deletePost = async (id: string) => {
    try {
        await deleteDoc(doc(db, "posts", id));
        toast({ title: "Deleted", description: "Post has been removed."});
    } catch(e: any) {
        console.error("Delete post error", e);
        toast({ title: "Error", description: "Could not delete post.", variant: "destructive" });
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
