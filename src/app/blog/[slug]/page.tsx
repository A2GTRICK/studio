import { fetchSinglePost, fetchAllPosts } from "@/services/posts";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata, ResolvingMetadata } from 'next';

import TableOfContentsFloating from "@/components/blog/TableOfContentsFloating";
import ShareButtons from "@/components/blog/ShareButtons";
import NewsletterBox from "@/components/blog/NewsletterBox";
import AdBox from "@/components/blog/AdBox";
import RecommendedPosts from "@/components/blog/RecommendedPosts";

type Props = { params: { slug: string } };

function slugify(text: string) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\- ]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/\-+/g, '-');
}

function extractHeadings(md: string) {
  const lines = md.split('\n');
  const headings: { id: string; text: string; level: number }[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
      const level = match[1].length;
      // Remove trailing hashes if someone uses "## Title ##"
      let text = match[2].replace(/\s+#+\s*$/, '').trim();
      const id = slugify(text);
      headings.push({ id, text, level });
    }
  }
  return headings;
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const post = await fetchSinglePost(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | pharmA2G Blog`,
    description: post.summary || 'An article from the pharmA2G blog.',
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.banner ? [post.banner] : [],
    },
  };
}

export default async function BlogViewPage({ params }: { params: { slug: string } }) {
  const post = await fetchSinglePost(params.slug);
  if (!post) notFound();

  // content markdown (string)
  const mdContent = post.content || '';

  // extract headings server-side for TOC
  const headings = extractHeadings(mdContent);

  // add ids to headings in rendered HTML by transforming markdown: here we rely on anchor links by matching headings text
  // ReactMarkdown brand: we'll manually add ids via a rehype plugin ideally, but for simplicity we transform heading rendering using components prop below.

  // Fetch related posts for "Read this also" (fallback to fetchAllPosts if available)
  let relatedPostsRaw = [] as any[];
  try {
    if (typeof fetchAllPosts === 'function') {
      const all = await fetchAllPosts();
      relatedPostsRaw = (all || [])
        .filter((p: any) => p.id !== post.id && (p.category === post.category))
        .slice(0, 3);
    }
  } catch (e) {
    // ignore, related stays []
  }

  // Convert Firestore Timestamps to serializable format for the client component
  const related = relatedPostsRaw.map(p => ({
    ...p,
    createdAt: p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : null,
    updatedAt: p.updatedAt ? { seconds: p.updatedAt.seconds, nanoseconds: p.updatedAt.nanoseconds } : null,
  }));


  const postDate = post.createdAt ? new Date(post.createdAt.seconds * 1000) : new Date();
  const canonicalUrl = `https://${process.env.NEXT_PUBLIC_BASE_URL?.replace(/^https?:\/\//,'') || 'pharma2g.com'}/blog/${post.id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    headline: post.title,
    image: post.banner ? [post.banner] : [],
    datePublished: postDate.toISOString(),
    dateModified: post.updatedAt ? new Date(post.updatedAt.seconds * 1000).toISOString() : postDate.toISOString(),
    author: { '@type': 'Person', name: post.author || 'A2G Smart Notes Team' },
    publisher: {
      '@type': 'Organization',
      name: 'pharmA2G',
      logo: { '@type': 'ImageObject', url: 'https://i.postimg.cc/k5CkkR0S/image-logo.png' }
    },
    description: post.summary,
  };

  // markdown renderers: add ids to heading elements so anchors work
  const components = {
    h1: ({node, ...props}: any) => {
      const text = String(props.children).replace(/\s+/g, ' ').trim();
      const id = slugify(text);
      return <h1 id={id} {...props} className="text-3xl md:text-4xl font-extrabold mt-6 mb-4" />;
    },
    h2: ({node, ...props}: any) => {
      const text = String(props.children).replace(/\s+/g, ' ').trim();
      const id = slugify(text);
      return <h2 id={id} {...props} className="text-2xl font-semibold mt-6 mb-3" />;
    },
    h3: ({node, ...props}: any) => {
      const text = String(props.children).replace(/\s+/g, ' ').trim();
      const id = slugify(text);
      return <h3 id={id} {...props} className="text-lg font-medium mt-5 mb-2" />;
    },
    a: (props: any) => <a {...props} className="text-primary hover:underline" />,
    img: (props: any) => <img {...props} className="rounded-lg mx-auto" alt={props.alt || ''} />,
  };

  return (
    <div className="bg-white py-12 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back link and sticky small header */}
        <div className="mb-6">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <main className="lg:col-span-2">
            <article className="prose lg:prose-xl max-w-none">
              <header className="mb-4 not-prose">
                <p className="text-sm text-primary font-semibold">{post.category}</p>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{post.title}</h1>
                <div className="mt-2 text-sm text-muted-foreground">
                  <span>Published on {postDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <ShareButtons title={post.title} url={canonicalUrl} />
                </div>
              </header>

              {post.banner && (
                <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl mb-8">
                  <Image src={post.banner} alt={post.title} fill className="object-cover" />
                </div>
              )}

              {/* Article content */}
              <div className="prose max-w-none">
                <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                  {mdContent}
                </ReactMarkdown>
              </div>

              {/* Author / CTA area */}
              <div className="mt-12 border-t pt-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Author</div>
                  <div className="text-sm text-muted-foreground">{post.author || 'A2G Smart Notes Team'}</div>
                </div>
                <div className="hidden md:block">
                  <NewsletterBox />
                </div>
              </div>

              {/* Ad placement */}
              <div className="mt-8">
                <AdBox />
              </div>
            </article>

            {/* Bottom: newsletter (mobile), recommended */}
            <div className="mt-8 lg:hidden">
              <NewsletterBox />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Related posts</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {related.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No related posts available.</div>
                ) : (
                  related.map((r:any) => (
                    <Link key={r.id} href={`/blog/${r.id}`} className="block p-4 border rounded-lg hover:shadow">
                      <h4 className="font-medium">{r.title}</h4>
                      <p className="text-xs text-muted-foreground mt-2">{r.summary?.slice(0,120)}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </main>

          {/* Right column: TOC (desktop), newsletter, recommended posts */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">On this page</h4>
                </div>
                <nav className="flex flex-col gap-2 text-sm">
                  {headings.map(h => (
                    <a key={h.id} href={`#${h.id}`} className={`block hover:text-primary ${h.level === 1 ? 'font-medium' : 'pl-3 text-muted-foreground'}`}>
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>

              <div>
                <NewsletterBox />
              </div>

              <div>
                <RecommendedPosts posts={related} />
              </div>

              <div>
                <AdBox />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating TOC (mobile + desktop) */}
      <TableOfContentsFloating headings={headings} />
    </div>
  );
}
