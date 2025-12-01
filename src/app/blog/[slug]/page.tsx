
import { fetchSinglePost, type Post } from "@/services/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await fetchSinglePost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: `${post.title} | pharmA2G Blog`,
    description: post.summary || 'An article from the pharmA2G blog.',
    openGraph: {
        title: post.title,
        description: post.summary,
        images: post.banner ? [post.banner] : [],
    },
  }
}


export default async function BlogViewPage({ params }: { params: { slug: string }}) {
  // NOTE: slug is actually the ID in this implementation
  const post = await fetchSinglePost(params.slug);

  if (!post) {
    notFound();
  }
  
  const postDate = post.createdAt ? new Date(post.createdAt.seconds * 1000) : new Date();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://pharma2g.com/blog/${post.id}`,
    },
    headline: post.title,
    image: post.banner ? [post.banner] : [],
    datePublished: postDate.toISOString(),
    dateModified: post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toISOString() : postDate.toISOString(),
    author: {
      '@type': 'Person',
      name: 'Arvind Sharma', // Assuming a single author for now
    },
    publisher: {
        '@type': 'Organization',
        name: 'pharmA2G',
        logo: {
            '@type': 'ImageObject',
            url: 'https://i.postimg.cc/k5CkkR0S/image-logo.png'
        }
    },
    description: post.summary,
  };

  return (
     <div className="bg-white py-12 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 max-w-4xl">
         <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Blog
            </Link>
        </div>

        <article className="prose lg:prose-xl max-w-none">
          <header className="mb-8 not-prose">
            <h1 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-gray-900 leading-tight">
              {post.title}
            </h1>
            <div className="mt-6">
                <p className="text-sm font-semibold text-primary">{post.category}</p>
                {post.createdAt && (
                    <p className="text-sm text-muted-foreground">
                        Posted on {postDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}
                    </p>
                )}
            </div>
          </header>

          {post.banner && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-12 not-prose">
              <Image
                src={post.banner}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
