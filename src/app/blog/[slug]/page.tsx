// app/blog/[slug]/page.tsx  (premium variant)
import { fetchSinglePost } from "@/services/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Link as LinkIcon, Copy, Share2 } from "lucide-react";
import type { Metadata } from "next";
import PageScripts from "./page-scripts";

// fetchRelatedPosts is not defined in services/posts.ts, so I will comment out the related parts.
// import { fetchRelatedPosts } from "@/services/posts"; 


export async function generateMetadata({ params }: { params: { slug:string } }): Promise<Metadata> {
  const post = await fetchSinglePost(params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | pharmA2G Blog`,
    description: post.summary || undefined,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.banner ? [{ url: post.banner }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
  };
}

/* Utility to estimate reading time (words / 220 wpm) */
function readingTime(text = "") {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}

/* Extract headings to build TOC (server-side simple regex) */
function extractHeadings(markdown = "") {
  const lines = markdown.split("\n");
  const headings: { level: number; text: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.*)/); // h2 and h3
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim() });
    }
  }
  return headings;
}

function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export default async function PremiumBlog({ params }: { params: { slug: string } }) {
  const post = await fetchSinglePost(params.slug);
  if (!post) notFound();

  const content = post.content || "";
  const headings = extractHeadings(content);
  const readTime = readingTime(content);
  const postDate = post.createdAt ? new Date(post.createdAt.seconds * 1000) : new Date();

  // Optional: server-side related posts fetch (implement in services/posts)
  let related: any[] = [];
  /*
  try {
    if (typeof fetchRelatedPosts === "function") {
      related = await fetchRelatedPosts(post.tags || [], 3);
    }
  } catch {
    // ignore
  }
  */

  const components = {
    h2: ({ node, ...props }: any) => {
      const text = String(props.children);
      const id = slugify(text);
      return (
        <h2 id={id} className="group text-2xl font-semibold mt-6 mb-3 flex items-center justify-between">
          <span>{props.children}</span>
          <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
            <a href={`#${id}`} className="inline-flex items-center gap-2 text-muted-foreground" aria-label={`Link to ${text}`}>
              <LinkIcon className="w-4 h-4" />
            </a>
            <button data-copy={id} className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" title="Copy link">
              <Copy className="w-3 h-3 inline-block" />
            </button>
          </span>
        </h2>
      );
    },
    h3: ({ node, ...props }: any) => {
      const text = String(props.children);
      const id = slugify(text);
      return (
        <h3 id={id} className="text-xl font-medium mt-5 mb-2 flex items-center justify-between">
          <span>{props.children}</span>
          <a href={`#${id}`} className="ml-3 text-sm text-muted-foreground" aria-hidden>
            #
          </a>
        </h3>
      );
    },
    a: (props: any) => <a {...props} className="text-primary hover:underline" target={props.href?.startsWith("#") ? undefined : "_blank"} rel="noopener noreferrer" />,
    img: (props: any) => (
      <div className="my-6">
        <img {...props} alt={props.alt || ""} className="rounded-lg mx-auto shadow-md max-w-full" />
      </div>
    ),
    p: (props: any) => <p {...props} className="leading-7 text-gray-800" />,
    ul: (props: any) => <ul {...props} className="list-disc pl-5" />,
    ol: (props: any) => <ol {...props} className="list-decimal pl-5" />,
    li: (props: any) => <li {...props} className="mb-2" />,
  };

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: post.banner ? [post.banner] : undefined,
    author: [{ "@type": "Person", name: (post as any).author || "A2G Smart Notes Team" }],
    datePublished: postDate.toISOString(),
    articleSection: post.category || undefined,
    description: post.summary || undefined,
  };

  /* Render */
  return (
    <div className="bg-white py-12 md:py-16">
      <PageScripts />
      <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8">
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
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-4">
                <span>{postDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                <span>•</span>
                <span>{readTime}</span>
              </div>
            </header>

            {post.banner && (
              <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-8">
                {/* priority image for hero */}
                <Image src={post.banner} alt={post.title} fill className="object-cover" priority />
              </div>
            )}

            <div className="prose max-w-none">
              <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>

            <div className="mt-12 pt-6 border-t">
              <div className="text-sm font-semibold">Author</div>
              <div className="text-sm text-muted-foreground">{(post as any).author || "A2G Smart Notes Team"}</div>
            </div>

            {/* Related posts (placeholder) */}
            {related.length > 0 && (
              <section className="mt-10">
                <h3 className="text-lg font-semibold">Related posts</h3>
                <ul className="mt-3 space-y-2">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/blog/${r.slug}`} className="text-primary hover:underline">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        </main>

        {/* Sidebar / TOC */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-24">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">On this page</h4>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, text: post.summary, url: window.location.href }).catch(() => {});
                    }
                  }}
                  className="inline-flex items-center gap-2 text-sm bg-white px-3 py-1 rounded shadow-sm"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>

              {headings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sections</p>
              ) : (
                <nav>
                  <ul className="space-y-2 text-sm">
                    {headings.map((h, idx) => {
                      const id = slugify(h.text);
                      return (
                        <li key={idx} className={h.level === 3 ? "pl-4" : ""}>
                          <a href={`#${id}`} className="hover:underline text-primary">
                            {h.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}
            </div>

            {/* small CTA */}
            <div className="mt-6 p-4 border rounded-lg">
              <div className="text-sm font-semibold mb-2">Enjoyed this?</div>
              <Link href="/subscribe" className="inline-block w-full text-center bg-primary text-white py-2 rounded">
                Subscribe to updates
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
