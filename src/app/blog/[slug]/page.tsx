
import { getBlogPostBySlug } from '@/services/blog';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Blog
            </Link>
        </div>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-gray-900 leading-tight">
              {post.title}
            </h1>
            <div className="mt-6 flex items-center gap-4 text-muted-foreground">
              <Image
                src={post.authorImage || 'https://picsum.photos/seed/author/40/40'}
                alt={post.authorName}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold text-gray-800">{post.authorName}</p>
                <p className="text-sm">
                  Posted on {format(post.createdAt.toDate(), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </header>

          {post.featuredImage && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-12">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="prose lg:prose-xl max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}

export default BlogPostPage;
