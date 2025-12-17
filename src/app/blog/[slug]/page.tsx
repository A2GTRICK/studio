// src/app/blog/[slug]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

// highlight.js for code blocks
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import atomOneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

import { ArrowLeft } from "lucide-react";
import ClientControls from "./client-controls";
import { fetchSinglePost, fetchRelatedPosts } from "@/services/posts";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("bash", bash);

/* -------------------------
   Types
------------------------- */
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

/* -------------------------
   Helpers & Components
------------------------- */

function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ");
}

function readingTime(text = "") {
  const words = stripHtml(text).trim().split(/\s+/).filter(Boolean).length || 0;
  const wpm = 220;
  const minutes = Math.max(1, Math.round(words / wpm));
  return `${minutes} min read`;
}

function extractHeadings(markdown = "") {
  const lines = markdown.split("\n");
  const headings: { level: number; text: string }[] = [];
  for (const line of lines) {
    let m = line.match(/^(#{2,3})\s+(.*)/);
    if (m) {
      headings.push({ level: m[1].length, text: m[2].trim() });
    }
  }
  return headings;
}

function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="my-6 w-full aspect-video rounded-xl overflow-hidden shadow-lg">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}

function PDFViewer({ url }: { url: string }) {
  return (
    <div className="my-6 border rounded-xl overflow-hidden h-96 shadow-lg">
      <iframe src={url} className="w-full h-full" />
    </div>
  );
}

function DriveEmbed({ url }: { url: string }) {
  return (
    <div className="my-6 border rounded-xl overflow-hidden h-96 shadow-lg">
      <iframe src={url} className="w-full h-full" />
    </div>
  );
}

const mdComponents: any = {
  h2: ({ node, ...props }: any) => {
    const text = String(props.children);
    return <h2 id={slugify(text)} {...props} className="text-2xl md:text-2xl font-semibold mt-8 mb-4 text-primary-dark" />;
  },
  h3: ({ node, ...props }: any) => {
    const text = String(props.children);
    return <h3 id={slugify(text)} {...props} className="text-xl font-medium mt-6 mb-3" />;
  },
  a: (props: any) => <a {...props} className="text-primary hover:underline break-words" target={props.href?.startsWith('#') ? undefined : '_blank'} rel="noopener noreferrer" />,
  img: (props: any) => <img {...props} alt={props.alt || ''} className="rounded-lg mx-auto shadow-md max-w-full" />,
  p: (props: any) => {
     const child = props.children?.[0];
     if (typeof child === "string") {
        if (child.startsWith("@youtube(")) {
          const url = child.replace("@youtube(", "").replace(")", "");
          const idMatch = url.match(/v=([^&]+)/) || url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
          const id = idMatch ? idMatch[1] : null;
          return id ? <YouTubeEmbed id={id} /> : null;
        }
        if (child.startsWith("@pdf(")) {
          const url = child.replace("@pdf(", "").replace(")", "");
          return <PDFViewer url={url} />;
        }
        if (child.startsWith("@drive(")) {
          const url = child.replace("@drive(", "").replace(")", "");
          return <DriveEmbed url={url} />;
        }
      }
    return <p {...props} className="leading-8 text-gray-800" />;
  },
  ul: (props: any) => <ul {...props} className="list-disc pl-6 space-y-2" />,
  ol: (props: any) => <ol {...props} className="list-decimal pl-6 space-y-2" />,
  li: (props: any) => <li {...props} className="mb-1" />,
  blockquote: (props: any) => <blockquote {...props} className="border-l-4 border-primary/30 bg-primary/5 p-4 italic text-gray-800 rounded" />,
  pre: (props: any) => <div {...props} className="rounded-md bg-gray-900 text-white overflow-auto not-prose" />,
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline ? (
      <SyntaxHighlighter
        style={atomOneDark}
        language={match ? match[1] : "text"}
        PreTag="div"
        customStyle={{ background: 'transparent', padding: '1rem' }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
};

/* -------------------------
   Metadata for SEO
------------------------- */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchSinglePost(params.slug);
  if (!post) return { title: "Post Not Found | pharmA2G" };

  const description = post.summary || stripHtml(post.content || "").slice(0, 160);

  return {
    title: `${post.title} | pharmA2G Blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.banner ? [{ url: post.banner, alt: post.title }] : undefined,
    },
    twitter: { card: post.banner ? "summary_large_image" : "summary", title: post.title, description },
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://studio--a2g-smart-notes-1st.us-central1.hosted.app"),
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

/* -------------------------
   Page (Server Component)
------------------------- */
export default async function BlogPage({ params }: { params: { slug: string } }) {
  const post: Post | null = await fetchSinglePost(params.slug);
  if (!post) notFound();

  const content = post.content || "";
  const headings = extractHeadings(content);
  const postDate =
    (post.createdAt && typeof post.createdAt !== "string" ? new Date(post.createdAt.seconds * 1000) : new Date(post.createdAt || undefined)) ||
    new Date();
  const rt = readingTime(content);

  let related: Post[] = [];
  try {
    if (typeof fetchRelatedPosts === "function") related = await fetchRelatedPosts(post.tags || [], 4);
  } catch {
    related = [];
  }

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
            <article className="max-w-none">
              <header className="mb-6">
                {post.category && <p className="text-sm text-primary font-semibold">{post.category}</p>}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{post.title}</h1>
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-3">
                  <span>{postDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span>•</span>
                  <span>{rt}</span>
                </div>
              </header>

              {post.banner && (
                <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-8">
                  <Image src={post.banner} alt={post.title} fill className="object-cover" priority />
                </div>
              )}

              <div className="prose lg:prose-lg max-w-none">
                 <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
                  {content}
                </ReactMarkdown>
              </div>

              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">Author</div>
                    <div className="text-sm text-muted-foreground">{post.author || "A2G Smart Notes Team"}</div>
                  </div>
                  <div className="text-right">
                    <Link href="/dashboard/billing" className="inline-block bg-primary text-white px-4 py-2 rounded-md text-sm shadow">
                      Subscribe for updates
                    </Link>
                  </div>
                </div>
              </div>

              <section className="mt-10">
                <h3 className="text-lg font-semibold">Suggested reads</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {related.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 p-4 rounded border border-gray-100 bg-gray-50">
                      <p className="text-sm text-muted-foreground">
                        We recommend categories: Pharmacology, Clinical Pharmacy, GPAT Tips — visit <Link href="/blog" className="text-primary hover:underline">Blog</Link>.
                      </p>
                    </div>
                  ) : (
                    related.map((r) => (
                      <Link key={r.id} href={`/blog/${r.slug}`} className="block p-4 border rounded hover:shadow-sm">
                        <div className="text-sm text-primary font-semibold">{r.category || "Article"}</div>
                        <div className="mt-2 font-medium text-gray-900">{r.title}</div>
                        {r.summary && <div className="mt-1 text-sm text-muted-foreground">{r.summary}</div>}
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </article>
          </main>

          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <ClientControls headings={headings} title={post.title} summary={post.summary} isDesktop={true} />
            </div>
          </aside>

          <div className="lg:hidden fixed left-0 right-0 bottom-4 px-4 z-40">
            <div className="mx-auto max-w-3xl">
              <ClientControls headings={headings} title={post.title} summary={post.summary} />
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            image: post.banner ? [post.banner] : undefined,
            author: [{ "@type": "Person", name: post.author || "A2G Smart Notes Team" }],
            datePublished: postDate.toISOString(),
            articleSection: post.category || undefined,
            description: post.summary || stripHtml(content).slice(0, 160),
            mainEntityOfPage: { "@type": "WebPage", "@id": `${process.env.NEXT_PUBLIC_BASE_URL || ""}/blog/${post.slug}` },
          }),
        }}
      />
    </div>
  );
}
