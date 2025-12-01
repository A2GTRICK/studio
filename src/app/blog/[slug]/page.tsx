
import { fetchSinglePost } from "@/services/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default async function BlogViewPage({ params }: { params: { slug: string }}) {
  // NOTE: slug is actually the ID in this implementation
  const post: any = await fetchSinglePost(params.slug);

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

        <article className="prose lg:prose-xl max-w-none">
          <header className="mb-8 not-prose">
            <h1 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-gray-900 leading-tight">
              {post.title}
            </h1>
            <div className="mt-6">
                <p className="text-sm font-semibold text-primary">{post.category}</p>
                {post.createdAt && (
                    <p className="text-sm text-muted-foreground">
                        Posted on {new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}
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
