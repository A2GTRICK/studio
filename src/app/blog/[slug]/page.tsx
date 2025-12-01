import { fetchSinglePost } from "@/services/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { slug: string };
};

/* ----------------------------- */
/*     DYNAMIC SEO METADATA      */
/* ----------------------------- */
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await fetchSinglePost(params.slug);

  if (!post) {
    return { title: "Post Not Found | pharmA2G Blog" };
  }

  return {
    title: `${post.title} | pharmA2G Blog`,
    description: post.summary ?? "",
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.banner ? [post.banner] : [],
    },
  };
}

/* ----------------------------- */
/*         MAIN BLOG VIEW        */
/* ----------------------------- */
export default async function BlogViewPage({ params }: Props) {
  const post = await fetchSinglePost(params.slug);

  if (!post) notFound();

  const postDate = post.createdAt
    ? new Date(post.createdAt.seconds * 1000)
    : new Date();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.banner ? [post.banner] : [],
    datePublished: postDate.toISOString(),
    dateModified: post.updatedAt
      ? new Date(post.updatedAt.seconds * 1000).toISOString()
      : postDate.toISOString(),
    author: {
      "@type": "Person",
      name: "Arvind Sharma",
    },
    publisher: {
      "@type": "Organization",
      name: "pharmA2G",
      logo: {
        "@type": "ImageObject",
        url: "https://i.postimg.cc/k5CkkR0S/image-logo.png",
      },
    },
    description: post.summary,
  };

  return (
    <div className="bg-white py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container max-w-4xl mx-auto px-4">

        {/* BACK BUTTON  */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-medium text-purple-600 hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        {/* HEADER */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-900">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-col">
            <span className="text-sm font-semibold text-purple-700">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">
              {post.createdAt &&
                postDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </span>
          </div>
        </header>

        {/* BANNER IMAGE */}
        {post.banner && (
          <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg mb-12">
            <Image
              src={post.banner}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* BLOG CONTENT */}
        <article
          className="
            prose 
            prose-lg 
            prose-purple 
            max-w-none 
            leading-relaxed 
            prose-headings:font-semibold
            prose-headings:text-gray-900 
            prose-a:text-purple-600 
            prose-a:font-medium 
            prose-a:hover:underline 
            prose-img:rounded-xl 
            prose-img:shadow 
            prose-table:border 
            prose-table:border-gray-300
            prose-th:bg-gray-100 
            prose-th:p-3 
            prose-td:p-3"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* TAGS */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10">
            {post.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-700 px-3 py-1 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}