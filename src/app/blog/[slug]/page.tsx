
import { fetchSinglePost } from "@/services/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from 'next';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchSinglePost(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | pharmA2G Blog`,
    description: post.summary || 'An article from the pharmA2G blog.',
  };
}

// Simple slugify function for generating anchor links from headings
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

// This is the main, simplified component for the blog post page.
export default async function BlogViewPage({ params }: { params: { slug: string } }) {
  const post = await fetchSinglePost(params.slug);
  if (!post) {
    notFound();
  }

  // A simple component map to add styles and IDs to headings for anchor links.
  const components = {
    h1: ({node, ...props}: any) => <h1 id={slugify(props.children)} {...props} className="text-3xl md:text-4xl font-extrabold mt-8 mb-4" />,
    h2: ({node, ...props}: any) => <h2 id={slugify(props.children)} {...props} className="text-2xl font-semibold mt-6 mb-3" />,
    h3: ({node, ...props}: any) => <h3 id={slugify(props.children)} {...props} className="text-xl font-medium mt-5 mb-2" />,
    a: (props: any) => <a {...props} className="text-primary hover:underline" />,
    img: (props: any) => <img {...props} className="rounded-lg mx-auto shadow-md" alt={props.alt || ''} />,
    ul: (props: any) => <ul {...props} className="list-disc pl-5" />,
    ol: (props: any) => <ol {...props} className="list-decimal pl-5" />,
    li: (props: any) => <li {...props} className="mb-2" />,
  };
  
  const postDate = post.createdAt ? new Date(post.createdAt.seconds * 1000) : new Date();

  return (
    <div className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        <article className="prose lg:prose-xl max-w-none">
          <header className="mb-6 not-prose">
            {post.category && <p className="text-sm text-primary font-semibold">{post.category}</p>}
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{post.title}</h1>
            <div className="mt-2 text-sm text-muted-foreground">
              <span>Published on {postDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </header>

          {/* Banner Image */}
          {post.banner && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-8">
              <Image src={post.banner} alt={post.title} fill className="object-cover" />
            </div>
          )}

          {/* Main Content Rendered with Markdown */}
          <div className="prose max-w-none">
             <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
              {post.content || ""}
            </ReactMarkdown>
          </div>

          {/* Author information */}
          <div className="mt-12 pt-6 border-t">
              <div className="text-sm font-semibold">Author</div>
              <div className="text-sm text-muted-foreground">{(post as any).author || 'A2G Smart Notes Team'}</div>
          </div>

        </article>
      </div>
    </div>
  );
}
