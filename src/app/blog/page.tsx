
import { fetchAllPosts, type Post } from "@/services/posts";
import Image from "next/image";
import Link from "next/link";
import { Rss, Loader2 } from 'lucide-react';
import { Suspense } from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The pharmA2G Blog | News, Updates & Insights',
  description: 'Explore the latest insights, news, and updates from the world of pharmacy. Your go-to resource for academic and career-focused articles.',
};

async function BlogList() {
  const posts = await fetchAllPosts();

  return (
    <>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: Post) => (
            <Link key={post.id} href={`/blog/${post.id}`} passHref>
              <div className="group bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col transition-transform transform hover:-translate-y-2 hover:shadow-2xl border border-gray-200">
                {post.banner && (
                  <div className="relative w-full h-48">
                    <Image
                      src={post.banner}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex-grow flex flex-col">
                  <span className="text-sm font-semibold text-primary">{post.category || 'General'}</span>
                  <h2 className="mt-2 text-xl font-bold font-headline text-gray-900 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                   <p className="mt-2 text-sm text-muted-foreground flex-grow line-clamp-3">{post.summary}</p>
                   <div className="mt-4 text-xs text-muted-foreground">
                     {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}) : ''}
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
    </>
  );
}

export default function BlogPage() {
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

        <Suspense fallback={
          <div className="flex flex-col justify-center items-center min-h-[400px]">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700">Loading Posts...</h2>
              <p className="text-muted-foreground">Please wait a moment.</p>
          </div>
        }>
          <BlogList />
        </Suspense>

      </div>
    </div>
  );
}
