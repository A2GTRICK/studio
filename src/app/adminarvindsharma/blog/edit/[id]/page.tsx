
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBlogPost, BlogPost } from '@/services/blog';
import { BlogPostForm } from '../../BlogPostForm';
import { Loader2 } from 'lucide-react';

export default function EditBlogPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;
    async function fetchPost() {
      try {
        const fetchedPost = await getBlogPost(id);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Failed to fetch post for editing:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return <div className="p-6">Post not found.</div>;
  }

  return (
    <div className="p-6">
      <BlogPostForm existingPost={post} />
    </div>
  );
}
