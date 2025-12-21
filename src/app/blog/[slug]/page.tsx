
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

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import atomOneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

import { ArrowLeft, Bell, Send } from "lucide-react";
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
  content?: string;
  banner?: string;
  summary?: string;
  category?: string;
  author?: string;
  createdAt?: { seconds: number } | string;
  tags?: string[];
};

/* -------------------------
   Helpers
------------------------- */
function slugify(text = "") {
  return text
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
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}

function extractHeadings(markdown = "") {
  return markdown
    .split("\n")
    .map((line) => {
      const m = line.match(/^(#{2,3})\s+(.*)/);
      return m ? { level: m[1].length, text: m[2].trim() } : null;
    })
    .filter(Boolean) as { level: number; text: string }[];
}

/* -------------------------
   Markdown Components
------------------------- */
const mdComponents: any = {
  h2: ({ children }: any) => (
    <h2
      id={slugify(String(children))}
      className="text-2xl font-semibold mt-10 mb-4 text-primary"
    >
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3
      id={slugify(String(children))}
      className="text-xl font-medium mt-8 mb-3"
    >
      {children}
    </h3>
  ),
  a: (props: any) => (
    <a
      {...props}
      className="text-primary underline"
      target={props.href?.startsWith("#") ? undefined : "_blank"}
      rel="noopener noreferrer"
    />
  ),
  code({ inline, className, children }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline ? (
      <SyntaxHighlighter
        style={atomOneDark}
        language={match ? match[1] : "text"}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">
        {children}
      </code>
    );
  },
};

/* -------------------------
   Metadata
------------------------- */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await fetchSinglePost(params.slug);
  if (!post) return { title: "Post Not Found | pharmA2G" };

  const description =
    post.summary || stripHtml(post.content || "").slice(0, 160);

  return {
    title: `${post.title} | pharmA2G Blog`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      images: post.banner ? [{ url: post.banner }] : undefined,
    },
  };
}

/* -------------------------
   Page
------------------------- */
export default async function BlogPage({
  params,
}: {
  params: { slug: string };
}) {
  const post: Post | null = await fetchSinglePost(params.slug);
  if (!post) notFound();

  const content = post.content || "";
  const headings = extractHeadings(content);
  const postDate =
    post.createdAt && typeof post.createdAt !== "string"
      ? new Date(post.createdAt.seconds * 1000)
      : new Date(post.createdAt || Date.now());

  let related: Post[] = [];
  try {
    related = await fetchRelatedPosts(post.tags || [], 4);
  } catch {}

  return (
    <div className="bg-white py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          href="/blog"
          className="inline-flex items-center text-sm text-primary mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Link>

        <div className="grid lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8">
            <article>
              <header className="mb-6">
                {post.category && (
                  <div className="text-sm font-semibold text-primary">
                    {post.category}
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl font-extrabold mt-2">
                  {post.title}
                </h1>
                <div className="mt-2 text-sm text-muted-foreground">
                  {postDate.toLocaleDateString("en-IN")} •{" "}
                  {readingTime(content)}
                </div>
              </header>

              {post.banner && (
                <div className="relative h-72 md:h-96 rounded-xl overflow-hidden mb-8">
                  <Image
                    src={post.banner}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="prose lg:prose-lg max-w-none">
                <ReactMarkdown
                  components={mdComponents}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {content}
                </ReactMarkdown>
              </div>

              {/* FREE CONNECTION CTA (NO BILLING, NO FORCE) */}
              <div className="mt-12 border-t pt-8 bg-primary/5 rounded-xl px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <div className="text-sm font-semibold">
                    Stay updated with pharmacy exam alerts
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Results, merit lists, and important updates — no spam.
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/dashboard/notifications"
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary/90"
                  >
                    <Bell className="w-4 h-4" />
                    Get alerts
                  </Link>

                  <a
                    href="https://t.me/a2gtrickacademy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-lg hover:shadow"
                  >
                    <Send className="w-4 h-4" />
                    Join Telegram
                  </a>
                </div>
              </div>

              {/* RELATED */}
              <section className="mt-12">
                <h3 className="text-lg font-semibold mb-4">
                  You may also like
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/blog/${r.slug}`}
                      className="p-4 border rounded hover:shadow"
                    >
                      <div className="text-sm text-primary font-semibold">
                        {r.category || "Article"}
                      </div>
                      <div className="mt-1 font-medium">{r.title}</div>
                      {r.summary && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {r.summary}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            </article>
          </main>

          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24">
              <ClientControls
                headings={headings}
                title={post.title}
                summary={post.summary}
                isDesktop
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
