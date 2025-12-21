
import { fetchPostBySlug, type Post } from "@/services/posts";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Clock, ArrowRight } from "lucide-react";

interface PageProps {
  params: { slug: string };
}

/* ===============================
   SEO METADATA
================================ */
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);
  if (!post) return {};

  const url = `https://pharma2g.com/blog/${post.slug}`;

  return {
    title: `${post.title} | pharmA2G Blog`,
    description:
      post.summary ||
      "Exam-focused pharmacy preparation insights by pharmA2G.",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url,
      type: "article",
      images: post.banner ? [post.banner] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: post.banner ? [post.banner] : [],
    },
  };
}

/* ===============================
   PAGE
================================ */
export default async function BlogPostPage({ params }: PageProps) {
  const post = await fetchPostBySlug(params.slug);
  if (!post) notFound();

  const publishedDate = post.createdAt
    ? new Date((post.createdAt as any).seconds * 1000)
    : null;

  /* ===============================
     ARTICLE SCHEMA (SEO)
  ================================ */
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    image: post.banner,
    datePublished: publishedDate?.toISOString(),
    author: {
      "@type": "Organization",
      name: "pharmA2G",
    },
    publisher: {
      "@type": "Organization",
      name: "pharmA2G",
    },
  };

  return (
    <article className="bg-white">
      {/* SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* CATEGORY */}
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          {post.category || "Pharmacy Exams"}
        </p>

        {/* TITLE */}
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
          {post.title}
        </h1>

        {/* META */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>✍️ pharmA2G Team</span>
          {publishedDate && (
            <span>
              {publishedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.readTime || "5 min read"}
          </span>
        </div>

        {/* BANNER */}
        {post.banner && (
          <div className="relative w-full h-[260px] my-8 rounded-2xl overflow-hidden">
            <Image
              src={post.banner}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* SUMMARY */}
        {post.summary && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {post.summary}
          </p>
        )}

        {/* CONTENT */}
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* EXAM CONTEXT (DIFFERENTIATION) */}
        <section className="mt-12 p-6 rounded-2xl bg-secondary/40">
          <h2 className="text-lg font-semibold mb-2">
            Why this article matters for exams
          </h2>
          <p className="text-muted-foreground">
            This article is written specifically for pharmacy aspirants
            preparing for competitive exams like{" "}
            <strong>GPAT</strong>, <strong>AIIMS</strong>,{" "}
            <strong>RRB Pharmacist</strong>, <strong>D.Pharm</strong>, and{" "}
            <strong>B.Pharm</strong>. Concepts are aligned with exam patterns
            and commonly asked topics.
          </p>
        </section>

        {/* INTERNAL CONVERSION */}
        <section className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-2">
            Ready to practice what you learned?
          </h3>
          <p className="text-muted-foreground mb-4">
            Try our exam-oriented mock tests and MCQ practice.
          </p>
          <Link
            href="/dashboard/mock-test"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            Explore Mock Tests <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </article>
  );
}
