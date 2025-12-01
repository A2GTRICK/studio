
'use client';

import { getBlogPosts, BlogPost } from '@/services/blog';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Rss, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const fetchedPosts = await getBlogPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700">Loading Posts...</h2>
            <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
    );
  }

  return (
    <div className="bg-secondary/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
                <Rss className="w-8 h-8" />
            </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-gray-900">
            The pharmA2G Blog
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Insights, news, and updates from the world of pharmacy.
          </p>
        </header>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} passHref>
                <div className="group bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col transition-transform transform hover:-translate-y-2 hover:shadow-2xl border border-gray-200">
                  <div className="relative w-full h-48">
                     <Image
                        src={post.featuredImage || 'https://picsum.photos/seed/1/600/400'}
                        alt={post.title}
                        fill
                        className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className="text-xl font-bold font-headline text-gray-900 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                      <Image
                        src={post.authorImage || 'https://picsum.photos/seed/author/40/40'}
                        alt={post.authorName}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>{post.authorName}</span>
                      <span className="text-gray-400">•</span>
                      <span>{format(post.createdAt.toDate(), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed">
            <h2 className="text-2xl font-semibold text-gray-700">No Posts Yet</h2>
            <p className="mt-2 text-muted-foreground">Check back soon for new articles!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogPage;
