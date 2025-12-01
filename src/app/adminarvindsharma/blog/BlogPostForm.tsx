
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createBlogPost, updateBlogPost, BlogPost } from '@/services/blog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

type BlogPostFormData = {
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  authorName: string;
  authorImage?: string;
  tags: string; // Stored as a comma-separated string in the form
};

interface BlogPostFormProps {
  existingPost?: BlogPost;
}

export function BlogPostForm({ existingPost }: BlogPostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<BlogPostFormData>({
    defaultValues: {
      title: existingPost?.title || '',
      slug: existingPost?.slug || '',
      content: existingPost?.content || '',
      featuredImage: existingPost?.featuredImage || '',
      authorName: existingPost?.authorName || 'Arvind Sharma',
      authorImage: existingPost?.authorImage || 'https://i.postimg.cc/k5CkkR0S/image-logo.png',
      tags: existingPost?.tags?.join(', ') || '',
    },
  });

  const titleValue = watch('title');

  useEffect(() => {
      if (titleValue && !existingPost) {
          setValue('slug', titleValue.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
      }
  }, [titleValue, setValue, existingPost]);

  const onSubmit = async (data: BlogPostFormData) => {
    setIsLoading(true);
    try {
      const postData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (existingPost) {
        await updateBlogPost({ ...postData, id: existingPost.id });
        toast({ title: "Success", description: "Blog post updated." });
      } else {
        // This is a type assertion because the service will add the timestamps
        await createBlogPost(postData as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>);
        toast({ title: "Success", description: "Blog post created." });
      }
      router.push('/adminarvindsharma/blog');
      router.refresh(); // Force refresh of the blog list page
    } catch (error) {
      console.error('Failed to save post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save the post. Check permissions or server status.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{existingPost ? 'Edit Post' : 'Create New Post'}</CardTitle>
          <CardDescription>Fill out the details for your blog article.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title', { required: 'Title is required' })} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" {...register('slug', { required: 'Slug is required' })} />
             {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea id="content" {...register('content', { required: 'Content is required' })} className="min-h-[400px] font-mono" />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImage">Featured Image URL</Label>
            <Input id="featuredImage" {...register('featuredImage')} />
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="authorName">Author Name</Label>
                <Input id="authorName" {...register('authorName', { required: 'Author name is required' })} />
                {errors.authorName && <p className="text-sm text-destructive">{errors.authorName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorImage">Author Image URL</Label>
                <Input id="authorImage" {...register('authorImage')} />
              </div>
           </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" {...register('tags')} placeholder="e.g., GPAT, Pharmacology, News" />
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
                Cancel
            </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Saving...' : 'Save Post'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
