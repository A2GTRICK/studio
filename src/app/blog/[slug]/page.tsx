// app/blog/[slug]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ArrowLeft } from "lucide-react";
import ClientControls from "./client-controls"; // small client file below OR inline client component
import { fetchSinglePost } from "@/services/posts"; // your service functions (adjust if needed)

// The fetchRelatedPosts function is not defined in services/posts.ts, so I will comment it out.
// import { fetchRelatedPosts } from "@/services/posts";

/* ---------------------------
  Types
----------------------------*/
type Post = {
  id: string;
  slug: string;
  title: string;
  content?: string; // markdown or HTML
  banner?: string;
  summary?: string;
  category?: string;
  author?: string;
  createdAt?: { seconds: number } | string;
  tags?: string[];
};

/* ---------------------------
  Utility helpers
----------------------------*/
function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function readingTime(text = "") {
  const words = text.replace(/<[^>]*>/g, "").trim().split(/\s+/).length || 0;
  const wpm = 220;
  const minutes = Math.max(1, Math.round(words / wpm));
  return `${minutes} min read`;
}

function extractHeadings(markdown = "") {
  const lines = markdown.split("\n");
  const headings: { level: number; text: string }[] = [];
  for (const line of lines) {
    // match ATX headings and also accept HTML headings lines (just in case content already HTML)
    let m = line.match(/^(#{2,3})\s+(.*)/); // ## or ###
    if (m) {
      headings.push({ level: m[1].length, text: m[2].trim() });
      continue;
    }
    // fallback: simple HTML heading snippet detection (<h2>Some</h2>)
    m = line.match(/^<h([23])[^>]*>(.*?)<\/h\1>/i);
    if (m) {
      headings.push({ level: Number(m[1]), text: m[2].replace(/<[^>]+>/g, "").trim() });
    }
  }
  return headings;
}

/* ---------------------------
  Metadata generator for SEO
----------------------------*/
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchSinglePost(params.slug);
  if (!post) return { title: "Post Not Found | pharmA2G" };

  const title = `${post.title} | pharmA2G Blog`;
  const description = post.summary || `${post.title} — read on pharmA2G`;
  const image = post.banner || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, alt: post.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://pharma2g.com"),
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

/* ---------------------------
  Main server component (App Router)
----------------------------*/
export default async function BlogPage({ params }: { params: { slug: string } }) {
  const post: Post | null = await fetchSinglePost(params.slug);
  if (!post) notFound();

  const content = post.content || "";
  const headings = extractHeadings(content);
  const postDate =
    (post.createdAt && typeof post.createdAt !== "string" ? new Date(post.createdAt.seconds * 1000) : new Date(post.createdAt || undefined)) ||
    new Date();
  const readTime = readingTime(content);

  // Fetch related posts server-side (optional; adjust fetchRelatedPosts implementation)
  let related: Post[] = [];
  /*
  try {
    if (typeof fetchRelatedPosts === "function") {
      related = await fetchRelatedPosts(post.tags || [], 4);
    }
  } catch {
    related = [];
  }
  */

  // react-markdown components -- headings include ids for anchors and TOC detection
  const mdComponents: any = {
    h1: ({ node, ...props }: any) => <h1 id={slugify(String(props.children))} {...props} className="text-3xl md:text-4xl font-extrabold mt-6 mb-4" />,
    h2: ({ node, ...props }: any) => {
      const text = String(props.children);
      return (
        <h2 id={slugify(text)} {...props} className="text-2xl font-semibold mt-6 mb-3 scroll-mt-20">
          {props.children}
        </h2>
      );
    },
    h3: ({ node, ...props }: any) => {
      const text = String(props.children);
      return (
        <h3 id={slugify(text)} {...props} className="text-xl font-medium mt-5 mb-2 scroll-mt-20">
          {props.children}
        </h3>
      );
    },
    a: (props: any) => <a {...props} className="text-primary hover:underline break-words" target={props.href?.startsWith("#") ? undefined : "_blank"} rel="noopener noreferrer" />,
    img: (props: any) => (
      <div className="my-6">
        {/* Use native img for markdown images; hero uses next/Image above */}
        {/* If you prefer Next Image for all images, create a custom MD image handler that uses next/image */}
        <img {...props} alt={props.alt || ""} className="rounded-lg mx-auto shadow-md max-w-full" />
      </div>
    ),
    p: (props: any) => <p {...props} className="leading-7 text-gray-800" />,
    ul: (props: any) => <ul {...props} className="list-disc pl-5" />,
    ol: (props: any) => <ol {...props} className="list-decimal pl-5" />,
    li: (props: any) => <li {...props} className="mb-2" />,
    blockquote: (props: any) => <blockquote {...props} className="border-l-4 pl-4 italic text-gray-700 my-4" />,
    pre: (props: any) => <pre {...props} className="rounded-md p-3 bg-gray-900 text-white overflow-auto" />,
    code: (props: any) => <code {...props} className="font-mono text-sm bg-gray-100 px-1 rounded" />,
  };

  return (
    <div className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8">
            <article className="prose lg:prose-xl max-w-none">
              <header className="not-prose mb-6">
                {post.category && <p className="text-sm text-primary font-semibold">{post.category}</p>}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{post.title}</h1>

                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-3">
                  <span>{postDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span>•</span>
                  <span>{readTime}</span>
                </div>
              </header>

              {post.banner && (
                <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-8">
                  <Image src={post.banner} alt={post.title} fill className="object-cover" priority />
                </div>
              )}

              {/* Render content: supports Markdown or stored HTML */}
              <div className="prose max-w-none">
                <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {content}
                </ReactMarkdown>
              </div>

              {/* Author & CTA */}
              <div className="mt-12 pt-6 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Author</div>
                    <div className="text-sm text-muted-foreground">{post.author || "A2G Smart Notes Team"}</div>
                  </div>
                  <div className="text-right">
                    <Link href="/dashboard/billing" className="inline-block bg-primary text-white px-4 py-2 rounded-md text-sm">
                      Subscribe for updates
                    </Link>
                  </div>
                </div>
              </div>

              {/* Related / Suggested reads */}
              <section className="mt-10">
                <h3 className="text-lg font-semibold">Suggested reads</h3>
                <div className="mt-3 space-y-3">
                  {related.length === 0 ? (
                    <p className="text-sm text-muted-foreground">We recommend these categories: Pharmacology, Clinical Pharmacy, GPAT Tips — visit <Link href="/blog" className="text-primary hover:underline">Blog</Link>.</p>
                  ) : (
                    <ul className="space-y-2">
                      {related.map((r) => (
                        <li key={r.slug}>
                          <Link href={`/blog/${r.slug}`} className="text-primary hover:underline">
                            {r.title}
                          </Link>
                          <div className="text-sm text-muted-foreground">{r.summary || ""}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </article>
          </main>

          {/* Sidebar / TOC (desktop) */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <ClientControls headings={headings} title={post.title} summary={post.summary} isDesktop={true} />
            </div>
          </aside>

          {/* Mobile TOC (sticky bottom small bar) */}
          <div className="lg:hidden fixed left-0 right-0 bottom-4 px-4 z-20">
            <div className="mx-auto max-w-3xl">
              <ClientControls headings={headings} title={post.title} summary={post.summary} />
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "image": post.banner ? [post.banner] : undefined,
            "author": [{ "@type": "Person", name: post.author || "A2G Smart Notes Team" }],
            "datePublished": postDate.toISOString(),
            "articleSection": post.category || undefined,
            "description": post.summary || undefined,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${process.env.NEXT_PUBLIC_BASE_URL || ""}/blog/${post.slug}`,
            },
          }),
        }}
      />
    </div>
  );
}
